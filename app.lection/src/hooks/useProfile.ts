import { httpClient } from "@/services/httpClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

interface Profile {
  accountId: string;
  username: string;
  points: number;
  shields: number;
  streakCount: number;
  lastActivityDate: string;
  createdAt: string;
}

interface ProfileResponse {
  profile: Profile;
}

interface PurchaseShieldResponse {
  success: boolean;
  message: string;
  newShieldsCount: number;
  newPointsBalance: number;
}

export function useProfile() {
  const queryClient = useQueryClient();

  // Buscar o perfil do usuário
  const { data, isLoading, error, refetch } = useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await httpClient.get<ProfileResponse>("/profiles");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });

  // Mutação para comprar escudo
  const purchaseShieldMutation = useMutation({
    mutationFn: async () => {
      const response = await httpClient.put<PurchaseShieldResponse>(
        "/profiles/buy-shield",
      );
      return response.data;
    },
    onSuccess: () => {
      // Atualizar cache do perfil após compra bem-sucedida
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: AxiosError) => {
      if (error.response?.data) {
        const message = (
          error.response.data as { error?: { message?: string } }
        )?.error?.message;
        toast.error(message ?? "Erro ao comprar escudo. Tente novamente.");
      }
    },
  });

  const purchaseShield = () => {
    return purchaseShieldMutation.mutate();
  };

  return {
    profile: data?.profile,
    isLoading,
    error,
    refetch,
    purchaseShield,
    isPurchasing: purchaseShieldMutation.isPending,
    purchaseError: purchaseShieldMutation.error,
  };
}
