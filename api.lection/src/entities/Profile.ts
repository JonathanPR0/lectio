export class Profile {
  readonly accountId: string;
  username: string;
  points: number;
  shields: number;
  streakCount: number;
  lastActivityDate: Date;
  readonly createdAt: Date;
  lastAnswers: Profile.LastAnswer[];

  constructor(attr: Profile.Attributes) {
    this.accountId = attr.accountId;
    this.username = attr.username;
    this.points = attr.points ?? 0;
    this.shields = attr.shields ?? 0;
    this.streakCount = attr.streakCount ?? 0;
    this.lastActivityDate = attr.lastActivityDate;
    this.createdAt = attr.createdAt ?? new Date();
    this.lastAnswers = attr.lastAnswers;
  }
}

export namespace Profile {
  export type Attributes = {
    accountId: string;
    username: string;
    points: number;
    shields: number;
    streakCount: number;
    lastActivityDate: Date;
    createdAt?: Date;
    lastAnswers: Profile.LastAnswer[];
  };

  export type LastAnswer = {
    dailyQuestionsId: string; // ID do conjunto de perguntas do dia
    questionId: number; // ID da pergunta respondida
    answeredAt: Date; // Data/hora da resposta
    userAnswerIndex: number; // Resposta dada pelo usuário
    answer: string; // Resposta correta
    answerIndex: number; // Índice da resposta correta
  };
}
