import { ResourceNotFound } from "@application/errors/application/ResourceNotFound";
import { AccountRepository } from "@infra/database/dynamo/repositories/AccountRepository";
import { DailyQuestionsRepository } from "@infra/database/dynamo/repositories/DailyQuestionsRepository";
import { ProfileRepository } from "@infra/database/dynamo/repositories/ProfileRepository";
import WrongDailyText from "@infra/emails/templates/questions/WrongDailyText";
import { ResendEmailGateway } from "@infra/gateways/ResendEmailGateway";
import { Injectable } from "@kernel/decorators/Injectable";
import { render } from "@react-email/render";
import { formatDate } from "date-fns/format";

const REPORT_RECIPIENT_EMAIL = "jonathan.amarante.dev@gmail.com";

@Injectable()
export class ReportWrongQuestionUseCase {
  constructor(
    private readonly dailyQuestionsRepository: DailyQuestionsRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly accountRepository: AccountRepository,
    private readonly emailGateway: ResendEmailGateway,
  ) {}

  async execute({
    idDailyQuestion,
    idQuestion,
    reportTitle,
    reportSubject,
    accountId,
  }: ReportWrongQuestionUseCase.Input): Promise<void> {
    const dailyQuestions = await this.dailyQuestionsRepository.findById(idDailyQuestion);
    if (!dailyQuestions) {
      throw new ResourceNotFound("Daily question not found");
    }
    const question = dailyQuestions.questions.find((q) => q.id === idQuestion);
    if (question) {
      const account = accountId ? await this.accountRepository.findById(accountId) : undefined;
      const profile = accountId
        ? await this.profileRepository.findByAccountId(accountId)
        : undefined;

      console.log(
        "email",
        JSON.stringify({
          user_name: profile?.username,
          user_email: account?.email,
          title: `${reportTitle} - Questão: ${question.id}`,
          message: reportSubject,
          daily_text_date: dailyQuestions.date,
        }),
      );

      try {
        console.log("daily date", {
          value: dailyQuestions.date,
          type: typeof dailyQuestions.date,
          isDate: dailyQuestions.date instanceof Date,
        });
        const html = await render(
          WrongDailyText({
            user_name: profile?.username,
            user_email: account?.email,
            title: `${reportTitle} - Questão: ${question.id}`,
            message: reportSubject,
            daily_text_date: dailyQuestions.date,
          }),
        );

        console.log("html", html);

        await this.emailGateway.send({
          to: REPORT_RECIPIENT_EMAIL,
          subject: `Lectio | Relato sobre o texto de ${formatDate(dailyQuestions.date, "dd/MM/yyyy")}`,
          html,
        });
      } catch (error) {
        console.error("Failed to send email:", error);
      }
    }
  }
}

export namespace ReportWrongQuestionUseCase {
  export type Input = {
    idDailyQuestion: string;
    idQuestion: number;
    reportTitle: string;
    reportSubject: string;
    accountId?: string;
  };

  export type Output = void;
}
