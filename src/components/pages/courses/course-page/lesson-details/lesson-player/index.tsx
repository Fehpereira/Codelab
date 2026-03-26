'use client';

import { markLessonAsCompleted } from '@/actions/course-progress';
import { QUERY_KEYS } from '@/constants/query-keys';
import { CourseLesson } from '@/generated/prisma';
import { usePreferencesStore } from '@/stores/preferences';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';

const VideoPlayer = dynamic(() => import('./video-player'), { ssr: false });

type LessonPlayerProps = {
  lesson: CourseLesson;
  nextLesson?: CourseLesson;
};

export const LessonPlayer = ({ lesson, nextLesson }: LessonPlayerProps) => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const autoplay = usePreferencesStore((state) => state.autoplay);
  const setExpandedModule = usePreferencesStore(
    (state) => state.setExpandedModule,
  );

  const videoId = lesson.videoId;
  const courseSlug = params.slug as string;

  const { mutateAsync: handleCompleteLesson } = useMutation({
    mutationFn: () =>
      markLessonAsCompleted({ lessonId: lesson.id, courseSlug }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courseProgress(courseSlug),
      });
    },
  });

  const handleMoveToNextLesson = async () => {
    await handleCompleteLesson();

    if (!autoplay || !nextLesson) return;

    if (nextLesson.moduleId !== lesson.moduleId) {
      setExpandedModule(nextLesson.moduleId);
    }

    router.push(
      `/courses/${courseSlug}/${nextLesson.moduleId}/lesson/${nextLesson.id}`,
    );
  };

  return (
    <div key={videoId} className="overflow-hidden w-full aspect-video bg-black">
      <VideoPlayer
        videoId={lesson.videoId}
        autoplay={autoplay}
        onEnd={handleMoveToNextLesson}
      />
    </div>
  );
};
