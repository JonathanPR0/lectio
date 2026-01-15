import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
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

// Schema de validação para solicitar código
const forgotPasswordSchema = z.object({
  email: z.email("Formato de e-mail inválido").min(1, "E-mail é obrigatório"),
});

// Schema de validação para redefinir senha
const resetPasswordSchema = z
  .object({
    code: z.string().min(6, "O código deve ter pelo menos 6 caracteres"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"email" | "reset" | "success">("email");
  const [userEmail, setUserEmail] = useState("");

  // Configuração do formulário de e-mail
  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Configuração do formulário de redefinição
  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Função para solicitar código de verificação
  async function handleRequestCode(data: ForgotPasswordFormData) {
    try {
      setIsSubmitting(true);

      // Chamada para a API para enviar código
      await httpClient.post("/auth/forgot-password", {
        email: data.email,
      });

      setUserEmail(data.email);
      setStep("reset");
      toast.success("Código enviado para seu e-mail!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Ocorreu um erro ao solicitar código de verificação";

      toast.error(errorMessage, {
        id: "forgot-password-error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Função para redefinir senha
  async function handleResetPassword(data: ResetPasswordFormData) {
    try {
      setIsSubmitting(true);

      // Chamada para a API para redefinir senha
      await httpClient.post("/auth/forgot-password/confirm", {
        email: userEmail,
        code: data.code,
        password: data.password,
      });

      setStep("success");
      toast.success("Senha redefinida com sucesso!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Ocorreu um erro ao redefinir a senha";

      toast.error(errorMessage, {
        id: "reset-password-error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center p-4 bg-[url('/patterns/confetti-light.svg')] dark:bg-[url('/patterns/confetti-dark.svg')] bg-fixed">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {step === "email" ? (
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

              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleRequestCode)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={emailForm.control}
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
                          Enviaremos um código de verificação para você
                          redefinir sua senha!
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
                          : "Enviar código de verificação"}
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
          ) : step === "reset" ? (
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
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  </motion.div>
                </div>
                <CardTitle className="text-2xl text-center">
                  Redefinir senha
                </CardTitle>
                <CardDescription className="text-center">
                  Verifique seu e-mail e insira o código recebido
                </CardDescription>
              </CardHeader>

              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(handleResetPassword)}>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-3 rounded-md border border-muted-foreground/20">
                      <p className="text-sm text-muted-foreground text-center">
                        Código enviado para{" "}
                        <span className="font-medium text-foreground">
                          {userEmail}
                        </span>
                      </p>
                    </div>

                    <FormField
                      control={resetForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código de verificação</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o código recebido"
                              type="text"
                              disabled={isSubmitting}
                              className="border-primary/20 focus-visible:ring-primary"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={resetForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova senha</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite sua nova senha"
                              type="password"
                              autoComplete="new-password"
                              disabled={isSubmitting}
                              className="border-primary/20 focus-visible:ring-primary"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={resetForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar nova senha</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite sua senha novamente"
                              type="password"
                              autoComplete="new-password"
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
                          Use uma senha forte com pelo menos 8 caracteres
                        </span>
                      </p>
                    </motion.div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Redefinindo...
                        </>
                      ) : (
                        "Redefinir senha"
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setStep("email")}
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      Voltar
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
                  Senha redefinida! 🎉
                </CardTitle>
                <CardDescription className="text-center">
                  Sua senha foi alterada com sucesso
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg border border-muted-foreground/20 relative">
                  <p className="text-muted-foreground text-center text-sm">
                    Sua senha foi redefinida com sucesso! Agora você pode fazer
                    login com sua nova senha.
                  </p>
                </div>

                <ol className="space-y-3">
                  <motion.li
                    className="flex items-start gap-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">
                      Senha redefinida com sucesso
                    </span>
                  </motion.li>
                  <motion.li
                    className="flex items-start gap-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">
                      Use sua nova senha para fazer login
                    </span>
                  </motion.li>
                </ol>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button variant="default" className="w-full group" asChild>
                  <Link to="/sign-in">Fazer login agora</Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
