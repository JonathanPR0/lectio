// import { LogOutIcon } from "lucide-react";

// import { useAuth } from "@/hooks/useAuth";
// import { ThemeSwitcher } from "./ThemeSwitcher";
// import { Button } from "./ui/Button";
// import { Tooltip } from "./ui/Tooltip";

// export function Appbar() {
//   const { signedIn, signOut } = useAuth();

//   return (
//     <div className="right-4 top-4 flex items-center gap-4 max-w-3xl mx-auto p-2">
//       <ThemeSwitcher />

//       {signedIn && (
//         <Tooltip content="Sair">
//           <Button
//             variant="secondary"
//             size="icon"
//             className="rounded-full"
//             onClick={signOut}
//           >
//             <LogOutIcon className="w4 h-4" />
//           </Button>
//         </Tooltip>
//       )}
//     </div>
//   );
// }

import {
  BookOpenIcon,
  LogOutIcon,
  MenuIcon,
  TrendingUp,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import logoImage from "@/assets/logo.svg";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/react-separator";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { Button } from "../ui/Button";
import { Tooltip } from "../ui/Tooltip";

export function Appbar() {
  const { signedIn, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Array de itens de navegação
  const navItems = [
    {
      name: "Estatísticas",
      path: "/",
      icon: <TrendingUp className="w-4 h-4" />,
      showWhen: "always",
    },
    {
      name: "Quiz do dia",
      path: "/questions",
      icon: <BookOpenIcon className="w-4 h-4" />,
      showWhen: "signed-in",
    },
  ];

  // Filtra os itens de navegação com base no estado de autenticação
  const filteredNavItems = navItems.filter(
    (item) =>
      item.showWhen === "always" ||
      (item.showWhen === "signed-in" && signedIn) ||
      (item.showWhen === "signed-out" && !signedIn),
  );

  // Função para verificar se uma rota está ativa
  const isActive = (path: string) => window.location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-5xl items-center mx-auto p-4">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoImage}
              alt="Logo"
              className="h-8 w-8"
              onError={(e) => {
                // Fallback para texto se a imagem falhar
                e.currentTarget.style.display = "none";
              }}
            />
          </Link>
        </div>

        {/* Navegação para desktop */}
        {/* <nav className="hidden md:flex items-center space-x-2 flex-1">
          {filteredNavItems.map((item) => (
            <Tooltip key={item.path} content={item.name}>
              <Button
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                asChild
                className={cn(
                  "transition-all",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "",
                )}
              >
                <Link to={item.path} className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </Button>
            </Tooltip>
          ))}
        </nav> */}

        {/* Itens do lado direito */}
        <div className="flex items-center gap-2 ml-auto">
          {signedIn && (
            <>
              <Separator
                orientation="vertical"
                className="h-6 mx-1 hidden sm:block"
              />

              <Tooltip content="Sair">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hidden sm:flex"
                  onClick={signOut}
                >
                  <LogOutIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
            </>
          )}

          {!signedIn && (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/sign-in">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/sign-up">Criar conta</Link>
              </Button>
            </div>
          )}
          <ThemeSwitcher />

          {/* Botão do menu mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 w-full bg-background border-b shadow-md origin-top"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className=" px-4 py-3 flex flex-col gap-2 border-t">
              <nav className="flex flex-col gap-2">
                {signedIn &&
                  filteredNavItems.map((item) => (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? "default" : "ghost"}
                      asChild
                      className={cn(
                        "justify-start",
                        isActive(item.path)
                          ? "bg-primary text-primary-foreground"
                          : "bg-foreground/5",
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    </Button>
                  ))}
              </nav>

              {!signedIn && (
                <div className="flex flex-col gap-2">
                  <Button variant="outline" asChild>
                    <Link
                      to="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Entrar
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link
                      to="/sign-up"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Criar conta
                    </Link>
                  </Button>
                </div>
              )}

              {signedIn && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="mt-2"
                >
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
