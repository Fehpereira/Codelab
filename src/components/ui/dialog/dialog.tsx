import { ReactNode } from 'react';
import {
  DialogContent,
  DialogHeader,
  Dialog as DialogRoot,
  DialogTitle,
  DialogTrigger,
} from './primitives';

type DialogProps = {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  title?: string;
  children?: ReactNode;
  content: ReactNode;
  width?: string;
  height?: string;
  preventOutisdeClick?: boolean;
};

export const Dialog = ({
  open,
  setOpen,
  title,
  children,
  content,
  width = '600px',
  height = '90vh',
  preventOutisdeClick,
}: DialogProps) => {
  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger>{children}</DialogTrigger>}
      <DialogContent
        style={{ maxWidth: width, maxHeight: height }}
        className="overflow-y-auto"
        onInteractOutside={(event) => {
          if (preventOutisdeClick) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}

        {content}
      </DialogContent>
    </DialogRoot>
  );
};
