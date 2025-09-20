import { storageKeys } from "@/config/storageKeys";
import { httpClient } from "./httpClient";

interface ISignUpDTO {
  username: string;
  email: string;
  password: string;
}

interface ISignInDTO {
  email: string;
  password: string;
}

interface ISignInResponse {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static getUserScore() {
    try {
      const todayProgress = localStorage.getItem(storageKeys.DAILY_ANSWERS);

      if (!todayProgress) {
        return 0;
      }
      const { state: parsedProgress } = JSON.parse(todayProgress);
      if (!parsedProgress || typeof parsedProgress !== "object") {
        return 0;
      }
      const answers = Object.entries(parsedProgress.answers || {}).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        }),
      );

      const score = answers.reduce((total: number, { answer }: any) => {
        if (answer?.isCorrect) {
          return total + answer.questionId * 10;
        }
        return total;
      }, 0);
      return score;
    } catch (error) {
      console.error("Erro ao obter progresso local:", error);
      return 0;
    }
  }

  static async signUp({ username, email, password }: ISignUpDTO) {
    const points = this.getUserScore();
    const { data } = await httpClient.post("/auth/sign-up", {
      username,
      email,
      password,
      points,
    });

    return data;
  }

  static async signIn({ email, password }: ISignInDTO) {
    const points = this.getUserScore();
    const { data } = await httpClient.post<ISignInResponse>("/auth/sign-in", {
      email,
      password,
      points,
    });

    return data;
  }

  static async refreshToken(refreshToken: string) {
    const { data } = await httpClient.post<ISignInResponse>(
      "/auth/refresh-token",
      {
        refreshToken,
      },
    );

    return data;
  }
}
