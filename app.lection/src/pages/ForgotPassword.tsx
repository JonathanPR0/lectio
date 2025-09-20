import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { httpClient } from "@/services/httpClient";

// Schema de validação
const forgotPasswordSchema = z.object({
  email: z.email("Formato de e-mail inválido").min(1, "E-mail é obrigatório"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Configuração do formulário com React Hook Form + Zod
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Função para lidar com o envio do formulário
  async function handleSubmit(data: ForgotPasswordFormData) {
    try {
      setIsSubmitting(true);

      // Chamada para a API
      await httpClient.post("/auth/forgot-password", {
        email: data.email,
      });

      // Mostrar mensagem de sucesso
      setSuccess(true);
    } catch (error: any) {
      // Tratar erros
      const errorMessage =
        error.response?.data?.message ||
        "Ocorreu um erro ao solicitar redefinição de senha";

      toast.error(errorMessage, {
        id: "forgot-password-error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 bg-[url('/patterns/confetti-light.svg')] dark:bg-[url('/patterns/confetti-dark.svg')] bg-fixed">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {!success ? (
            <Card className="border-primary/20 shadow-lg">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-center mb-2">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [0.8, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-primary"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V5C20 3.89543 19.1046 3 18 3H6C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21ZM16 11H8M16 7H8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </motion.div>
                </div>
                <CardTitle className="text-2xl text-center">
                  Ops! Esqueceu a senha?
                </CardTitle>
                <CardDescription className="text-center">
                  Acontece com os melhores de nós! Vamos ajudar a recuperá-la.
                </CardDescription>
              </CardHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qual é o seu e-mail?</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="seu@email.com"
                              type="email"
                              autoComplete="email"
                              disabled={isSubmitting}
                              className="border-primary/20 focus-visible:ring-primary"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <motion.div
                      className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-md border border-amber-200 dark:border-amber-800"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-amber-800 dark:text-amber-200 text-sm flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          Enviaremos um link para você voltar à sua jornada
                          bíblica!
                        </span>
                      </p>
                    </motion.div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-3">
                    <Button
                      type="submit"
                      className="w-full relative overflow-hidden group"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <motion.span
                          className="absolute inset-0 bg-primary/20"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 5, repeat: Infinity }}
                        />
                      )}
                      <span className="relative z-10 flex items-center">
                        {isSubmitting
                          ? "Enviando..."
                          : "Enviar link de recuperação"}
                      </span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="xs"
                      asChild
                      className="w-full"
                    >
                      <Link to="/sign-in">
                        Lembrei minha senha! Voltar para login
                      </Link>
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          ) : (
            <Card className="border-green-500/20 shadow-lg">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2"
                  >
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </motion.div>
                </div>
                <CardTitle className="text-2xl text-center">
                  E-mail a caminho! 🚀
                </CardTitle>
                <CardDescription className="text-center">
                  Fique de olho na sua caixa de entrada
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg border border-muted-foreground/20 relative">
                  <motion.div
                    className="absolute -top-2 -right-2 bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-xs"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    1
                  </motion.div>
                  <p className="text-muted-foreground text-center">
                    Enviamos um e-mail para{" "}
                    <span className="font-medium text-foreground">
                      {form.getValues().email}
                    </span>{" "}
                    com instruções para redefinir sua senha.
                  </p>
                </div>

                <motion.div
                  className="flex items-center justify-center space-x-2 text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="h-px bg-muted-foreground/30 w-full"></div>
                  <span className="text-xs whitespace-nowrap">
                    Próximos passos
                  </span>
                  <div className="h-px bg-muted-foreground/30 w-full"></div>
                </motion.div>

                <ol className="space-y-3">
                  <motion.li
                    className="flex items-start gap-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">1</span>
                    </div>
                    <span className="text-sm">
                      Abra o e-mail e clique no link de recuperação
                    </span>
                  </motion.li>
                  <motion.li
                    className="flex items-start gap-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.1 }}
                  >
                    <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">2</span>
                    </div>
                    <span className="text-sm">
                      Crie uma nova senha fácil de lembrar (mas difícil de
                      adivinhar 😉)
                    </span>
                  </motion.li>
                  <motion.li
                    className="flex items-start gap-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.3 }}
                  >
                    <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">3</span>
                    </div>
                    <span className="text-sm">
                      Volte para continuar sua jornada bíblica!
                    </span>
                  </motion.li>
                </ol>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button variant="default" className="w-full group" asChild>
                  <Link to="/sign-in">Voltar para login</Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSuccess(false)}
                  className="w-full"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Tentar com outro e-mail
                </Button>
              </CardFooter>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
