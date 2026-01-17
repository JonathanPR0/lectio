import {
  BookOpenIcon,
  Gamepad2,
  LogOutIcon,
  MenuIcon,
  TrendingUp,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import logoImage from "@/assets/logo.svg";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { Button } from "../ui/Button";

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
    {
      name: "Jogos",
      path: "/games",
      icon: <Gamepad2 className="w-4 h-4" />,
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
  const isMobile = window.innerWidth < 768;
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-5xl items-center mx-auto p-4 justify-between">
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

        {/* Navegação desktop */}
        <nav className="hidden items-center gap-2 ml-auto mr-4">
          {signedIn &&
            filteredNavItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link to={item.path} className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </Button>
            ))}
        </nav>

        {/* Itens do lado direito */}
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          {/* Botão do menu hamburguer */}
          {signedIn && (
            <>
              <ThemeSwitcher />
              <Button
                variant="ghost"
                size="icon"
                className="border"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <XIcon className="h-5 w-5 text-foreground" />
                ) : (
                  <MenuIcon className="h-5 w-5 text-foreground" />
                )}
              </Button>
            </>
          )}
          {!signedIn && (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  Entrar
                </Link>
              </Button>
              <Button asChild>
                <Link to="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  Criar conta
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Menu mobile  */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 w-full bg-background border-b shadow-md origin-top z-40"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-md px-4 py-3 flex flex-col gap-2 border-t">
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
                          : "bg-foreground/5 hover:text-foreground",
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

      {/* Menu desktop (Sheet) */}
      <div className="hidden md:block">
        <Sheet
          open={mobileMenuOpen && !isMobile}
          onOpenChange={(bool) => !isMobile && setMobileMenuOpen(bool)}
        >
          <SheetContent
            side="right"
            className="w-80 hidden md:flex flex-col p-4"
          >
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>

            <div className="flex-1 flex flex-col gap-4 mt-4 w-full">
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
                          : "bg-foreground/5 hover:text-foreground",
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
                <div className="flex flex-col gap-2 mt-auto">
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
                  className="mt-auto"
                >
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
