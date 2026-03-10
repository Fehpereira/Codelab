'use server';

import {
  calculateInstallmentOptions,
  formatName,
  unMockValue,
} from '@/lib/utils';
import { ServerError } from '@/server/error';
import {
  creditCardCheckoutSchema,
  CreditCardCheckoutSchema,
  pixCheckoutSchema,
  PixCheckoutSchema,
} from '@/server/schemas/payment';
import { getUser } from './user';
import { prisma } from '@/lib/prisma';
import { asaasApi } from '@/lib/asaas';
import { headers } from 'next/headers';
import { isAxiosError } from 'axios';
import { z } from 'zod';
import { Course } from '@/@types/types';

type AuthenticatedUser = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  clerkUserId: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
  asaasId: string | null;
};

type CreateCustomerPayload = {
  name: string;
  cpf: string;
  postalCode: string;
  addressNumber: string;
};

type CreditCardPayload = {
  cardNumber: string;
  cardCvv: string;
  cardValidThru: string;
  installments: number;
  creditCardHolderInfo: {
    email: string;
    phone: string;
  } & CreateCustomerPayload;
};

type SanitizablePayload = {
  cpf?: string;
  postalCode?: string;
};

function verifyPayload<TSchema extends z.AnyZodObject>(
  schema: TSchema,
  payload: z.input<TSchema>,
): z.output<TSchema> {
  const input = schema.safeParse(payload);

  if (!input.success) {
    throw new ServerError({
      message: 'Falha ao processar o pagamento',
      code: 'INVALID_DATA',
    });
  }

  const sanitizedPayload = {
    ...input.data,
  } as z.output<TSchema> & SanitizablePayload;

  if (typeof sanitizedPayload.cpf === 'string') {
    sanitizedPayload.cpf = unMockValue(sanitizedPayload.cpf);
  }

  if (typeof sanitizedPayload.postalCode === 'string') {
    sanitizedPayload.postalCode = unMockValue(sanitizedPayload.postalCode);
  }

  return sanitizedPayload;
}

async function findCourseById(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ServerError({
      message: 'Curso não encontrado',
      code: 'NOT_FOUND',
    });
  }

  return course;
}

async function verifyIfUserHasCourse(courseId: string, userId: string) {
  const userHasCourse = await prisma.coursePurchase.findFirst({
    where: {
      courseId,
      userId,
    },
  });

  if (userHasCourse) {
    throw new ServerError({
      message: 'Você já possui acesso a este curso',
      code: 'CONFLICT',
    });
  }
}

async function createAsaasCustomer(
  user: AuthenticatedUser,
  userId: string,
  { name, addressNumber, cpf, postalCode }: CreateCustomerPayload,
) {
  let customerId = user?.asaasId;

  if (!customerId) {
    const { data: newCustomer } = await asaasApi.post('/customers', {
      name: name ?? formatName(user.firstName, user.lastName),
      email: user.email,
      cpfCnpj: cpf,
      postalCode,
      addressNumber,
    });

    if (!newCustomer) {
      throw new ServerError({
        message: 'Falha ao processar o pagamento',
        code: 'FAILED_TO_CREATE_CUSTOMER',
      });
    }

    customerId = newCustomer.id as string;

    await prisma.user.update({
      where: { id: userId },
      data: { asaasId: customerId },
    });
  }

  return customerId;
}

async function finishPixPayment(course: Course, customerId: string) {
  const price = course?.discountPrice ?? course?.price;

  const paymentPayload = {
    customer: customerId,
    billingType: 'PIX',
    value: price,
    dueDate: new Date().toISOString().split('T')[0],
    description: `Compra do curso "${course.title}"`,
    externalReference: course.id,
  };

  const { data } = await asaasApi.post('/payments', paymentPayload);

  return {
    invoiceId: data.id as string,
  };
}

export const createPixCheckout = async (payload: PixCheckoutSchema) => {
  const { userId, user } = await getUser();

  const { courseId, cpf, name, postalCode, addressNumber } = verifyPayload(
    pixCheckoutSchema,
    payload,
  );

  const course = await findCourseById(courseId);

  await verifyIfUserHasCourse(courseId, userId);

  const customerId = await createAsaasCustomer(user, userId, {
    cpf,
    addressNumber,
    name,
    postalCode,
  });

  const { invoiceId } = await finishPixPayment(course, customerId);

  return { invoiceId };
};

async function finishCreditCardPayment(
  course: Course,
  customerId: string,
  {
    cardNumber,
    cardValidThru,
    cardCvv,
    installments,
    creditCardHolderInfo,
  }: CreditCardPayload,
) {
  const price = course?.discountPrice ?? course?.price;

  const installmentOptions = calculateInstallmentOptions(price);
  const installmentData = installmentOptions.find(
    (item) => item.installments === installments,
  );

  const installmentTotal = installmentData?.total ?? price;

  const nextHeader = await headers();

  const remoteIp =
    nextHeader.get('x-real-ip') ||
    nextHeader.get('x-forwarded-for') ||
    nextHeader.get('x-client-ip');

  const paymentPayload = {
    customer: customerId,
    billingType: 'CREDIT_CARD',
    value: installmentTotal,
    dueDate: new Date().toISOString().split('T')[0],
    description: `Compra do curso "${course.title}"`,
    externalReference: course.id,
    creditCard: {
      holderName: creditCardHolderInfo.name,
      number: unMockValue(cardNumber),
      expiryMonth: cardValidThru.split('/')[0],
      expiryYear: cardValidThru.split('/')[1],
      ccv: cardCvv,
    },
    creditCardHolderInfo: {
      ...creditCardHolderInfo,
      cpfCnpj: creditCardHolderInfo.cpf,
    },
    remoteIp,
    installmentCount: installments > 1 ? installments : undefined,
    installmentValue:
      installments > 1 ? installmentData?.installmentValue : undefined,
  };

  try {
    await asaasApi.post('/payments', paymentPayload);
  } catch (error) {
    const gerericError = {
      message: 'Falha ao processar o pagamento',
      code: 'FAILED_TO_CREATE_PAYMENT',
    };

    if (!isAxiosError(error)) {
      throw new ServerError(gerericError);
    }

    console.error(error?.response?.data);

    const firstErrorDescription =
      (error?.response?.data?.errors?.[0]?.description as string) ?? '';

    if (firstErrorDescription.includes('não autorizada')) {
      throw new ServerError({
        code: 'NOT_AUTHORIZED',
        message:
          'Transação não autorizada. Verifique os dados do cartão de crédito e tente novamente.',
      });
    }

    throw new ServerError(gerericError);
  }
}

export const createCreditCardCheckout = async (
  payload: CreditCardCheckoutSchema,
) => {
  const { userId, user } = await getUser();

  const {
    courseId,
    name,
    cardCvv,
    cardNumber,
    cardValidThru,
    installments,
    cpf,
    addressNumber,
    phone,
    postalCode,
  } = verifyPayload(creditCardCheckoutSchema, payload);

  const course = await findCourseById(courseId);

  await verifyIfUserHasCourse(courseId, userId);

  const customerId = await createAsaasCustomer(user, userId, {
    name,
    addressNumber,
    cpf,
    postalCode,
  });

  const paymentPayload: CreditCardPayload = {
    cardNumber,
    cardCvv,
    cardValidThru,
    installments,
    creditCardHolderInfo: {
      email: user.email,
      phone,
      addressNumber,
      cpf,
      name,
      postalCode,
    },
  };

  await finishCreditCardPayment(course, customerId, paymentPayload);
};

export const getPixQrCode = async (invoiceId: string) => {
  await getUser();

  const { data } = await asaasApi.get<PixResponse>(
    `/payments/${invoiceId}/pixQrCode`,
  );

  return data;
};

export const getInvoiceStatus = async (invoiceId: string) => {
  await getUser();

  const { data } = await asaasApi.get(`/payments/${invoiceId}`);

  return {
    status: data.status as string,
  };
};
