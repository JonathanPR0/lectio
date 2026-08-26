import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { httpClient } from "@/services/httpClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flag, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const reportSchema = z.object({
  reportTitle: z.string().min(1, "Selecione um motivo"),
  reportSubject: z
    .string()
    .trim()
    .min(5, "Descreva o problema com pelo menos 5 caracteres")
    .max(1000, "A descrição deve ter no máximo 1000 caracteres"),
});

type ReportForm = z.infer<typeof reportSchema>;

const reportReasons = [
  "A pergunta está incorreta",
  "A resposta correta parece errada",
  "Há um erro de gramática ou digitação",
  "As alternativas estão confusas",
  "Outro problema",
];

interface ReportQuestionDialogProps {
  idDailyQuestion: string;
  idQuestion: number;
}

export function ReportQuestionDialog({
  idDailyQuestion,
  idQuestion,
}: ReportQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reportTitle: "", reportSubject: "" },
  });
  const isSubmitting = form.formState.isSubmitting;

  const submitReport = async (values: ReportForm) => {
    try {
      await httpClient.put("/questions/report", {
        idDailyQuestion,
        idQuestion,
        reportTitle: values.reportTitle,
        reportSubject: values.reportSubject,
      });
      toast.success("Obrigado pelo aviso! Vamos analisar essa questão.");
      form.reset();
      setOpen(false);
    } catch {
      toast.error("Não foi possível enviar o relatório. Tente novamente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive hover:bg-transparent"
          aria-label="Reportar problema nesta questão"
        >
          <Flag className="mr-2 h-4 w-4" />
          Reportar problema
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Encontrou algo errado?</DialogTitle>
          <DialogDescription>
            Seu aviso ajuda a manter o quiz correto. Conte o que precisa ser
            revisado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submitReport)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="reportTitle" className="text-sm font-medium">
              O que precisa ser revisado?
            </label>
            <Controller
              control={form.control}
              name="reportTitle"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="reportTitle"
                    aria-label="Motivo do relatório"
                  >
                    <SelectValue placeholder="Selecione um motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.reportTitle && (
              <p className="text-sm text-destructive">
                {form.formState.errors.reportTitle.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="reportSubject" className="text-sm font-medium">
                Detalhes
              </label>
              <span className="text-xs text-muted-foreground">
                {form.watch("reportSubject").length}/1000
              </span>
            </div>
            <Textarea
              id="reportSubject"
              {...form.register("reportSubject")}
              disabled={isSubmitting}
              placeholder="Explique brevemente o que parece estar errado..."
              rows={5}
              className="flex min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            {form.formState.errors.reportSubject && (
              <p className="text-sm text-destructive">
                {form.formState.errors.reportSubject.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? "Enviando..." : "Enviar relatório"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
