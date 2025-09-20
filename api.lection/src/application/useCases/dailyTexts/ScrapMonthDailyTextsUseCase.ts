import { ScrapDailyText } from "@application/services/ScrapDailyText";
import { DailyTextsQueueGateway } from "@infra/gateways/DailyTextsQueueGateway";
import { Injectable } from "@kernel/decorators/Injectable";
import { addMonths } from "date-fns";

@Injectable()
export class ScrapMonthDailyTextsUseCase {
  constructor(private readonly dailyTextsQueueGateway: DailyTextsQueueGateway) {}

  async execute(): Promise<ScrapMonthDailyTextsUseCase.Output> {
    const today = new Date();
    // const endDate = addDays(today, 1);
    const endDate = addMonths(today, 1);

    // Data de controle para iteração
    const currentDate = new Date(today);

    try {
      while (currentDate < endDate) {
        const dailyTexts = await ScrapDailyText.execute({ referenceDate: currentDate });
        // Envia cada texto diário para a fila

        for (const dailyText of dailyTexts) {
          // Validação básica antes de enfileirar
          if (dailyText.date && dailyText.themeVerse && dailyText.bibleVersicle) {
            await this.dailyTextsQueueGateway.publish({
              dailyText: {
                date: dailyText.date,
                themeVerse: dailyText.themeVerse,
                bibleVersicle: dailyText.bibleVersicle,
                paragraphs: dailyText.paragraphs,
              },
            });
          }
        }

        // Avança 2 dias para a próxima consulta
        // Como cada consulta retorna 3 dias, isso dá uma sobreposição de 1 dia
        // que ajuda a garantir que não perderemos nenhum dia
        currentDate.setDate(currentDate.getDate() + 2);

        // Pequeno delay para não sobrecarregar o servidor
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch {
      return;
    }
  }
}

export namespace ScrapMonthDailyTextsUseCase {
  export type Input = void;
  export type Output = void;
}
