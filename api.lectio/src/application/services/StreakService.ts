import { differenceInDays } from "date-fns";
import { Profile } from "src/entities/Profile";

export class StreakService {
  static updateStreak(profile: Profile): Profile {
    const daysDifference = differenceInDays(new Date(), profile.lastActivityDate);

    if (daysDifference >= 1 && profile.streakCount > 0) {
      if (daysDifference <= profile.shields) {
        // Usa os escudos para proteger a sequência
        profile.shields -= daysDifference;
        profile.lastActivityDate = new Date();
      } else {
        // Zera a sequência se não houver escudos suficientes
        profile.streakCount = 0;
        profile.shields = 0; // Garante que os escudos sejam zerados
      }
    }

    return profile;
  }
}
