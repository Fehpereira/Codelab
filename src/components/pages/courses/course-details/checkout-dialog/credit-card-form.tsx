import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form/field';
import { InputField } from '@/components/ui/form/input-field';
import { Form } from '@/components/ui/form/primitives';
import { creditCardCheckoutFormSchema } from '@/server/schemas/payment';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import z from 'zod';

type CreditCardFormProps = {};

type FormData = z.infer<typeof creditCardCheckoutFormSchema>;

export const CreditCardForm = ({}: CreditCardFormProps) => {
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

  const { handleSubmit } = form;

  const onSubmit = (data: FormData) => {};

  return (
    <Form {...form}>
      <form className="flex flex-col">
        <div className="flex items-center gap-4 flex-col">
          <div>
            <p></p>
          </div>

          <div className="w-full grid sm:grid-cols-2 gap-2 flex-1">
            <InputField name="cardNumber" label="Número do cartão" />
          </div>

          <div></div>
        </div>

        <div>
          <Button
            variant="outline"
            className="flex items-center justify-between mt-6"
          >
            <ArrowLeft />
            Voltar
          </Button>

          <Button type="submit">
            Confirmar
            <ArrowRight />
          </Button>
        </div>
      </form>
    </Form>
  );
};
