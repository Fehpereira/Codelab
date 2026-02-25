'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { ModuleItem } from './module-item';
import { usePreferencesStore } from '@/stores/preferences';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PanelRightOpen } from 'lucide-react';
import { useEffect, useRef } from 'react';

type ModulesListProps = {
  modules: CourseModuleWithLessons[];
};

export const ModulesList = ({ modules }: ModulesListProps) => {
  const moduleId = modules[0].id;
  const {
    expandedModule,
    setExpandedModule,
    modulesListCollapsed,
    setModulesListCollapsed,
  } = usePreferencesStore();

  const initialCollpased = useRef(false);

  useEffect(() => {
    if (initialCollpased.current) return;

    initialCollpased.current = true;

    setModulesListCollapsed(window.innerWidth < 768);
  }, [setModulesListCollapsed]);

  const handleToggleCollapsed = () => {
    setModulesListCollapsed(!modulesListCollapsed);
  };

  return (
    <aside
      className={cn(
        'h-full border-l border-border bg-sidebar p-4 overflow-y-auto overflow-x-hidden min-w-[380px] max-w-[380px] transition-all flex flex-col items-center',
        modulesListCollapsed
          ? 'w-18 max-w-18 min-w-18 hidden sm:flex'
          : 'fixed top-0 bottom-0 z-10 right-0 sm:relative',
      )}
    >
      <div
        className={cn(
          'absolute z-10 left-0 top-0 bottom-0 w-4 flex justify-start group cursor-e-resize group',
          modulesListCollapsed && 'cursor-w-resize',
        )}
        onClick={handleToggleCollapsed}
      >
        <div className="h-full w-0.5 group-hover:bg-sidebar-border transition-all"></div>
      </div>

      {modulesListCollapsed ? (
        <Button size="icon" variant="outline" onClick={handleToggleCollapsed}>
          <PanelRightOpen />
        </Button>
      ) : (
        <>
          <Button
            variant="outline"
            onClick={handleToggleCollapsed}
            className="w-full flex sm:hidden mb-4"
          >
            Fechar módulos
          </Button>
          <Accordion.Root
            type="single"
            className="w-full h-full flex flex-col gap-3"
            collapsible
            defaultValue={moduleId}
            value={expandedModule ?? undefined}
            onValueChange={setExpandedModule}
          >
            {modules?.map((courseModule) => (
              <ModuleItem key={courseModule.id} data={courseModule} />
            ))}
          </Accordion.Root>
        </>
      )}
    </aside>
  );
};
