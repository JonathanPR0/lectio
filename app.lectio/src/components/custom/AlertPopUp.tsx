import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { JSX } from "react";

interface TAlert {
  title: string;
  description?: string;
  children: JSX.Element;
  action: any;
  className?: string;
  open?: boolean;
  onOpenChange?: ((open: boolean) => void) | undefined;
  disabled?: boolean;
  stopPropagation?: boolean;
}

const AlertPopUp = ({
  title,
  description,
  children,
  action,
  className,
  open,
  onOpenChange,
  disabled,
  stopPropagation,
}: TAlert) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger
        disabled={disabled}
        asChild
        className={className}
        onClick={(e) => {
          if (stopPropagation) {
            e.stopPropagation();
          }
        }}
      >
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent
        onClick={(e) => stopPropagation && e.stopPropagation()}
        onCloseAutoFocus={(e) => stopPropagation && e.stopPropagation()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={action}
            disabled={disabled}
            className="bg-destructive hover:bg-destructive/80 text-white"
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertPopUp;
