import { Injectable } from "@kernel/decorators/Injectable";
import { AppConfig } from "src/shared/config/AppConfig";

@Injectable()
export class ResendEmailGateway {
  constructor(private readonly config: AppConfig) {}

  async send({ to, subject, html }: ResendEmailGateway.Input): Promise<void> {
    const apiKey = this.config.emails.resend.apiKey;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Lectio <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send email with Resend: ${response.status} ${error}`);
    }
  }
}

export namespace ResendEmailGateway {
  export type Input = {
    to: string;
    subject: string;
    html: string;
  };
}
