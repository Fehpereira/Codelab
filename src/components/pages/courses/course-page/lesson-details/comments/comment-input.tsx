'use client';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@clerk/nextjs';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLessonComment } from '@/actions/course-comments';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useGetParams } from '@/hooks/useGetParams';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Comentário é obrigatório' })
    .max(500, { message: 'Comentário deve ter no máximo 500 caracteres' }),
});

type FormData = z.infer<typeof formSchema>;

type CommentInputProps = {
  parentCommentId?: string;
  autoFocus?: boolean;
  className?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
};

export const CommentInput = ({
  parentCommentId,
  autoFocus,
  className,
  onCancel,
  onSuccess,
}: CommentInputProps) => {
  const queryClient = useQueryClient();

  const { user } = useUser();

  const { lessonId, slug } = useGetParams('lessonId', 'slug');

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  });

  const { mutate: createComment, isPending } = useMutation({
    mutationFn: createLessonComment,
    mutationKey: QUERY_KEYS.lessonComments(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lessonComments(lessonId),
      });

      reset();

      if (onSuccess) onSuccess();

      toast.success('Comentário criado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao criar comentário');
    },
  });

  const onSubmit = (data: FormData) => {
    createComment({
      courseSlug: slug,
      lessonId,
      content: data.content,
      parentId: parentCommentId,
    });
  };

  return (
    <form
      className={cn('flex gap-4', className)}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Avatar src={user?.imageUrl} fallback={user?.fullName} />

      <Controller
        control={control}
        name="content"
        render={({ field }) => (
          <Textarea
            {...field}
            placeholder="Deixe seu comentário"
            className="min-h-[100px]"
            autoFocus={autoFocus}
          />
        )}
      />
      <div className="flex gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          Comentar
        </Button>
      </div>
    </form>
  );
};
