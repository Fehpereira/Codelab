import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form/field';
import { InputField } from '@/components/ui/form/input-field';
import { Form } from '@/components/ui/form/primitives';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select/select';
import { Separator } from '@/components/ui/separator';
import { creditCardCheckoutFormSchema } from '@/server/schemas/payment';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import Cards from 'react-credit-cards-2';
import { Course } from '@/@types/types';
import { useMemo } from 'react';
import { calculateInstallmentOptions, formatPrice } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { createCreditCardCheckout } from '@/actions/payment';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { error } from 'console';
import { useValidateCep } from './useValidateCep';

type CreditCardFormProps = {
  onBack: () => void;
  onClose: () => void;
  course: Course;
};

type FormData = z.infer<typeof creditCardCheckoutFormSchema>;

export const CreditCardForm = ({
  onBack,
  onClose,
  course,
}: CreditCardFormProps) => {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(creditCardCheckoutFormSchema),
    defaultValues: {
      installments: 1,
      cardCvv: '',
      cardNumber: '',
      cardValidThru: '',
      name: '',
      addressNumber: '',
      cpf: '',
      phone: '',
      postalCode: '',
    },
  });

  const { handleSubmit, watch, setError } = form;

  const formValues = watch();
  const rawCep = watch('postalCode');

  const installmentsOptions = useMemo(() => {
    return calculateInstallmentOptions(
      course?.discountPrice ?? course.price,
    ).map((option) => ({
      label: `${option.installments}x ${formatPrice(option.installmentValue)}${option.hasInterest ? '' : ' (sem juros)'}`,
      value: String(option.installments),
    }));
  }, [course?.discountPrice, course.price]);

  const { mutateAsync: handleCheckout, isPending: isLoading } = useMutation({
    mutationFn: createCreditCardCheckout,
    onSuccess: async () => {
      toast.success('Pagamento efetuado com sucesso!');

      onClose();

      toast.success(
        'Agradecemos por sua compra! Você será redirecionado para o curso em instantes.',
      );
      await new Promise((resolve) => setTimeout(resolve, 4000));

      router.push(`/courses/${course.slug}`);
    },
    onError: (error) => {
      if (error.name === 'NOT_AUTHORIZED') {
        toast.error(error.message);
        return;
      }

      if (error.name === 'CONFLICT') {
        toast.error('Você já possui acesso a este curso!');
        onClose();
        return;
      }

      toast.error(
        'Ocorreu um erro ao processar o pagamento. Tente novamente ou entre em contato com o suporte.',
      );
    },
  });

  const { mutateAsync: validateCep, isPending: isValidatingCep } =
    useValidateCep(rawCep, setError);

  const onSubmit = async (data: FormData) => {
    const isValidCep = await validateCep();

    if (!isValidCep) return;

    toast.promise(
      handleCheckout({
        ...data,
        courseId: course.id,
      }),
      {
        loading: 'Processando pagamento...',
      },
    );
  };

  return (
    <Form {...form}>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center gap-4 flex-col">
          <div>
            <Cards
              number={formValues.cardNumber}
              expiry={formValues.cardValidThru}
              cvc={formValues.cardCvv}
              name={formValues.name}
              placeholders={{ name: 'NOME COMPLETO' }}
              locale={{ valid: 'Valido até' }}
            />
          </div>

          <div className="w-full grid sm:grid-cols-2 gap-2 flex-1">
            <InputField
              name="name"
              placeholder="Nome impresso no cartão"
              className="col-span-full"
            />
            <InputField
              name="cpf"
              placeholder="CPF do titular"
              mask="___.___.___-__"
            />
            <FormField name="phone">
              {({ field }) => (
                <Input
                  {...field}
                  onChange={({ target }) => {
                    const value = target.value.replace(/\D/g, '');
                    field.onChange(value);
                  }}
                  placeholder="Telefone do titular com DDD"
                />
              )}
            </FormField>

            <Separator className="col-span-full my-1 sm:my-2" />

            <InputField
              name="cardNumber"
              placeholder="Número do cartão"
              mask="____ ____ ____ ____"
            />
            <InputField
              name="cardValidThru"
              placeholder="Validade"
              mask="__/__"
            />
            <InputField name="cardCvv" placeholder="CVV" mask="___" />
            <FormField name="installments">
              {({ field }) => (
                <Select
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  options={installmentsOptions}
                  placeholder="Parcelas"
                />
              )}
            </FormField>

            <Separator className="col-span-full my-1 sm:my-2" />
            <div className="col-span-full grid sm:grid-cols-[1.4fr_1fr_1fr] gap-2">
              <InputField name="address" placeholder="Endereço (Opcional)" />
              <InputField name="addressNumber" placeholder="Número" />
              <InputField
                name="postalCode"
                placeholder="CEP"
                mask="_____-___"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            type="button"
            className="flex items-center justify-between mt-6"
            onClick={onBack}
          >
            <ArrowLeft />
            Voltar
          </Button>

          <Button type="submit" disabled={isLoading || isValidatingCep}>
            Confirmar
            <ArrowRight />
          </Button>
        </div>
      </form>
    </Form>
  );
};
