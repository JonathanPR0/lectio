import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Importe o logo se estiver disponível
import logo from "@/assets/logo.svg";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthService } from "@/services/AuthService";
import { Separator } from "@radix-ui/react-dropdown-menu";

interface IFormData {
  username: string;
  email: string;
  password: string;
}

export function SignUp() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<IFormData>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit(
    async ({ username, email, password }) => {
      try {
        setIsLoading(true);
        await AuthService.signUp({ username, email, password });
        toast.success("Conta criada com sucesso!");
        navigate("/");
      } catch (error) {
        console.error(error);
        toast.error("Erro ao criar conta. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    },
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="rounded-full bg-primary/10 p-3"
            >
              <img src={logo} className="p-1 h-10 w-10 text-primary" />
            </motion.div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Criar Conta
          </h1>
          <p className="text-muted-foreground mt-1">
            Junte-se a nós em uma jornada de conhecimento bíblico
          </p>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">Crie sua conta</CardTitle>
            <CardDescription>
              Digite seus dados para começar sua jornada bíblica
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              id="signup-form"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="username">Apelido</Label>
                <Input
                  id="username"
                  placeholder="Como deseja ser chamado"
                  className="border-primary/20 focus-visible:ring-primary"
                  {...form.register("username", {
                    required: "Apelido é obrigatório",
                    minLength: {
                      value: 3,
                      message: "O apelido deve ter pelo menos 3 caracteres",
                    },
                  })}
                />
                {form.formState.errors.username && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="border-primary/20 focus-visible:ring-primary"
                  {...form.register("email", {
                    required: "E-mail é obrigatório",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Endereço de e-mail inválido",
                    },
                  })}
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  className="border-primary/20 focus-visible:ring-primary"
                  {...form.register("password", {
                    required: "Senha é obrigatória",
                    minLength: {
                      value: 6,
                      message: "A senha deve ter pelo menos 6 caracteres",
                    },
                  })}
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            </form>
          </CardContent>

          <Separator className="bg-primary/10" />

          <CardFooter className="flex flex-col pt-2">
            <Button
              form="signup-form"
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Criando conta...
                </div>
              ) : (
                "Criar Conta"
              )}
            </Button>

            <div className="w-full text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link
                  to="/sign-in"
                  className="text-primary hover:underline font-medium"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
