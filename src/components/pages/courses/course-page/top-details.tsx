'use client';

import { CourseWithModulesAndLessons } from '@/@types/types';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip } from '@/components/ui/tooltip';
import { useGetParams } from '@/hooks/useGetParams';
import { usePreferencesStore } from '@/stores/preferences';
import { PanelRightOpen } from 'lucide-react';
import Link from 'next/link';

type TopDetailsProps = {
  course: CourseWithModulesAndLessons;
};

export const TopDetails = ({ course }: TopDetailsProps) => {
  const { autoplay, setAutoPlay, setModulesListCollapsed } =
    usePreferencesStore();

  const { moduleId, lessonId } = useGetParams('moduleId', 'lessonId');

  const currentModule = course.modules.find((mod) => mod.id === moduleId);
  const currentLesson = currentModule?.lessons.find(
    (lesson) => lesson.id === lessonId,
  );

  return (
    <div className="w-full flex items-center gap-4 sm:gap-6 p-4 sm:p-6 border-b border-border bg-sidebar sticky top-0 z-10">
      <BackButton />

      <div className="flex items-center gap-2 text-xs sm:text-sm">
        <Link
          href={`/courses/details/${course.slug}`}
          className="font-semibold hover:text-primary transition-all line-clamp-1"
        >
          {course.title}
        </Link>
        <span className="text-muted-foreground">/</span>
        <p className="hidden sm:block line-clamp-1">{currentModule?.title}</p>

        <span className="text-muted-foreground hidden sm:block">/</span>

        <p className="line-clamp-1">{currentLesson?.title}</p>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Tooltip content="Ativar Autoplay">
          <div className="flex items-center gap-2">
            <span className="text-xs block sm:hidden">Autoplay</span>
            <Switch
              checked={autoplay}
              onCheckedChange={(checked) => setAutoPlay(checked)}
            />
          </div>
        </Tooltip>
        <Button
          size="icon"
          variant="outline"
          onClick={() => setModulesListCollapsed(false)}
          className="flex sm:hidden"
        >
          <PanelRightOpen />
        </Button>
      </div>
    </div>
  );
};
