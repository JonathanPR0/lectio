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

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;

    if (isStandalone) {
      setShowInstall(false);
      return;
    } else {
      setShowInstall(true);
    }

    const handler = (e: Event) => {
      console.log("beforeinstallprompt event triggered");
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      console.log("App foi instalado.");
      setShowInstall(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", () => {
        setShowInstall(false);
      });
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };

  // Show manual install instructions if we can't show the native prompt
  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  if (!showInstall) return null;

  const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

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
            <CardDescription className="sr-only"></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Instale o Lectio como um aplicativo para uma experiência mais
                fluida.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleInstall}
                  className="w-full cursor-pointer"
                >
                  Instalar aplicativo
                  <Download className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShowInstructions}
                  className="w-full"
                >
                  Ver instruções manuais
                  <Info className="ml-2 h-4 w-4" />
                </Button>
              </div>
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
