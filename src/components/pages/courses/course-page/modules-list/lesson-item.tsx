import {
  markLessonAsCompleted,
  unmarkLessonAsCompleted,
} from '@/actions/course-progress';
import { Tooltip } from '@/components/ui/tooltip';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useGetParams } from '@/hooks/useGetParams';
import { cn, formatDuration } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircleCheckBig, CircleX, Video } from 'lucide-react';
import Link from 'next/link';

type LessonItemProps = {
  lesson: CourseLesson & {
    completed: boolean;
  };
};

export const LessonItem = ({ lesson }: LessonItemProps) => {
  const queryClient = useQueryClient();

  const courseSlug = useGetParams('slug');
  const currentLessonId = useGetParams('lessonId');

  const lessonId = lesson.id;
  const completed = lesson.completed;

  const PrimaryIcon = completed ? CircleCheckBig : Video;
  const SecondaryIcon = completed ? CircleX : CircleCheckBig;

  const { mutate: handleCompleteLesson, isPending: isCompletingLesson } =
    useMutation({
      mutationFn: () => markLessonAsCompleted({ lessonId, courseSlug }),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.courseProgress(courseSlug),
        });
      },
    });

  const {
    mutate: handleUnmarkLessonAsCompleted,
    isPending: inUnmarkingLessonAsCompleted,
  } = useMutation({
    mutationFn: () => unmarkLessonAsCompleted(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courseProgress(courseSlug),
      });
    },
  });

  const isLoading = isCompletingLesson || inUnmarkingLessonAsCompleted;

  return (
    <Link
      className={cn(
        'flex items-center gap-2 text-muted-foreground text-sm p-2 hover:bg-muted/50 transition-all rounded-md',
        lesson.id === currentLessonId && 'text-white',
        completed && 'text-primary',
      )}
      href={`/courses/${courseSlug}/${lesson.moduleId}/lesson/${lesson.id}`}
    >
      <Tooltip
        content={
          completed ? 'Marcar como não assistido' : 'Marcar como assistido'
        }
      >
        <button
          type="button"
          className="w-4 min-w-4 h-4 relative group/lesson-button disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            if (completed) {
              handleUnmarkLessonAsCompleted();
              return;
            }

            handleCompleteLesson();
          }}
        >
          <PrimaryIcon className="w-full h-full opacity-100 transition-all group-hover/lesson-button:opacity-0" />
          <SecondaryIcon className="absolute inset-0 w-full h-full opacity-0 transition-all group-hover/lesson-button:opacity-100" />
        </button>
      </Tooltip>
      <p className="line-clamp-1 ">{lesson.title}</p>

      <p className=" text-xs text-muted-foreground ml-auto">
        {formatDuration(lesson.durationInMs, true)}
      </p>
    </Link>
  );
};
