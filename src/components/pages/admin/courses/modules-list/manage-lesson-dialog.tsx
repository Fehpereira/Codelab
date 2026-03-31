import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/form/input-field';
import { Form } from '@/components/ui/form/primitives';
import { CreateCourseFormData } from '@/server/schemas/course';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import { FormField } from '@/components/ui/form/field';
import { Editor } from '@/components/ui/editor';
import { Dialog } from '@/components/ui/dialog/dialog';

const formSchema = z.object({
  title: z.string().nonempty({ message: 'Campo obrigatório' }),
  description: z.string().nonempty({ message: 'Campo obrigatório' }),
  videoId: z.string().nonempty({ message: 'Campo obrigatório' }),
  durationInMs: z.coerce.number().min(1, { message: 'Campo obrigatório' }),
});

type LessonFormData = z.infer<typeof formSchema>;

type ManageLessonDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  moduleIndex: number;
};

export const ManageLessonDialog = ({
  open,
  setOpen,
  moduleIndex,
}: ManageLessonDialogProps) => {
  const {
    getValues,
    setValue,
    reset: resetForm,
  } = useFormContext<CreateCourseFormData>();

  const form = useForm<LessonFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      videoId: '',
      durationInMs: 0,
    },
  });

  const { handleSubmit } = form;

  const onSubmit = (data: LessonFormData) => {
    const modules = getValues('modules');

    // TODO: edit lesson

    modules[moduleIndex].lessons.push({
      ...data,
      id: createId(),
      order: 1,
    });

    setValue('modules', modules, { shouldValidate: true });
    resetForm(getValues());

    setOpen(false);
  };

  return (
    <Dialog
      title="Adicionar Aula"
      open={open}
      setOpen={setOpen}
      content={
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <InputField name="title" label="Título" />
            <FormField name="description" label="Descrição">
              {({ field }) => (
                <Editor value={field.value} onChange={field.onChange} />
              )}
            </FormField>
            <div className="grid md:grid-cols-2 gap-6">
              <InputField name="videoId" label="ID do vídeo" />
              <InputField
                name="durationInMs"
                label="Duração em Milissegundos"
                type="number"
              />
            </div>
            <Button
              className="max-w-max ml-auto"
              onClick={() => handleSubmit(onSubmit)()}
            >
              Adicionar
            </Button>
          </form>
        </Form>
      }
    />
  );
};
