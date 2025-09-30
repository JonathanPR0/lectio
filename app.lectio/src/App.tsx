import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect } from "react";
import { Router } from "./Router";
import { Appbar } from "./components/custom/Appbar";
import { Toaster } from "./components/ui/Toaster";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { queryClient } from "./lib/queryClient";

// Função para registrar o Service Worker
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    console.log("Tentando registrar o Service Worker...");
    console.log(navigator);

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registrado com sucesso:", registration);
      })
      .catch((error) => {
        console.error("Falha ao registrar o Service Worker:", error);
      });
  } else {
    console.warn("Service Workers não são suportados neste navegador.");
  }
}

export function App() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Appbar />

          <Router />

          <Toaster richColors />
        </ThemeProvider>
      </AuthProvider>
      {/* Opcional: React Query Devtools para desenvolvimento */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
