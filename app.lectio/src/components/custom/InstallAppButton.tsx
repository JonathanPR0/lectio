import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Download, Info, MoreVertical, Share } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Verifica se o navegador é compatível com PWA
    const isPWACompatible =
      ("serviceWorker" in navigator && window.location.protocol === "https:") ||
      window.location.hostname === "localhost";

    // Exibe o botão se for desktop ou dispositivo móvel com navegador compatível
    if (isPWACompatible) {
      setShowInstallButton(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne o comportamento padrão do navegador
      e.preventDefault();
      // Armazena o evento para poder dispará-lo mais tarde
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Sempre mostra o botão quando o evento é disparado
      setShowInstallButton(true);
    };

    // Adiciona listener para o evento beforeinstallprompt
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Verificamos quando o app é instalado
    window.addEventListener("appinstalled", () => {
      setShowInstallButton(false);
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Mostra o prompt de instalação se estiver disponível
      deferredPrompt.prompt();

      // Espera o usuário responder ao prompt
      const { outcome } = await deferredPrompt.userChoice;

      // Se o usuário aceitar a instalação, esconde o botão
      if (outcome === "accepted") {
        setShowInstallButton(false);
      }

      // Limpa o prompt armazenado, só pode ser usado uma vez
      setDeferredPrompt(null);
    } else {
      // Se não temos o prompt, mostramos instruções de como instalar manualmente
      setShowInstructions(true);
    }
  };

  // Detecta o sistema operacional para mostrar instruções específicas
  const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  if (!showInstallButton) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-semibold text-lg">
              <Download className="h-5 w-5" />
              Instalar o Lectio
            </CardTitle>
            <CardDescription className="sr-only">
              Adicione o Lectio à sua tela inicial para acesso rápido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Instale o Lectio como um aplicativo para uma melhor experiência
              </p>
              <Button onClick={handleInstallClick} className="w-full">
                Instalar aplicativo
                <Download className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="sm:max-w-md rounded-md">
          <DialogHeader>
            <DialogTitle>Como instalar o Lectio</DialogTitle>
            <DialogDescription>
              Siga as instruções abaixo para adicionar o Lectio à sua tela
              inicial
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isIOS && (
              <div className="flex flex-col gap-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  No Safari (iOS):
                </h3>
                <ol className="list-decimal ml-5 space-y-2 text-sm">
                  <li>
                    Toque no ícone de compartilhar{" "}
                    <Share className="inline h-4 w-4" />
                  </li>
                  <li>
                    Role para baixo e selecione "Adicionar à Tela de Início"
                  </li>
                  <li>Confirme tocando em "Adicionar"</li>
                </ol>
              </div>
            )}

            {isAndroid && (
              <div className="flex flex-col gap-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  No Chrome (Android):
                </h3>
                <ol className="list-decimal ml-5 space-y-2 text-sm">
                  <li>
                    Toque no menu <MoreVertical className="inline h-4 w-4" />
                  </li>
                  <li>
                    Selecione "Instalar aplicativo" ou "Adicionar à tela
                    inicial"
                  </li>
                  <li>Confirme a instalação</li>
                </ol>
              </div>
            )}

            {!isMobileDevice && (
              <div className="flex flex-col gap-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  No Chrome/Edge (Desktop):
                </h3>
                <ol className="list-decimal ml-5 space-y-2 text-sm">
                  <li>Clique no ícone de instalação na barra de endereço</li>
                  <li>
                    Ou clique no menu{" "}
                    <MoreVertical className="inline h-4 w-4" />
                  </li>
                  <li>Selecione "Instalar Lectio..."</li>
                </ol>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowInstructions(false)}
            >
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
