import logo from "@/assets/logo.svg"; // Importa a imagem diretamente
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { BiLogIn } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface IFormData {
  email: string;
  password: string;
}

export function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const form = useForm<IFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit(async ({ email, password }) => {
    try {
      await signIn(email, password);
      toast.success("Login realizado com sucesso!");
    } catch {
      toast.error("Credenciais inválidas!");
    }
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
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
            Lectio
          </h1>
          <p className="text-muted-foreground mt-1">
            Acesse sua conta para começar
          </p>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
            <CardDescription>
              Entre com seus dados para continuar sua jornada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="border-primary/20 focus-visible:ring-primary"
                  {...form.register("email", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Button
                    variant="link"
                    className="text-xs text-primary p-0 h-auto font-normal"
                    onClick={() => navigate("/forgot-password")}
                    type="button"
                  >
                    Esqueceu a senha?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="border-primary/20 focus-visible:ring-primary"
                  {...form.register("password", { required: true })}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <BiLogIn className="h-5 w-5" />
                    Entrar
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          <Separator className="bg-primary/10" />
          <CardFooter className="flex flex-col">
            <Button
              variant="link"
              className="text-sm text-primary"
              onClick={() => navigate("/sign-up")}
            >
              Não tem uma conta? Registre-se aqui
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
