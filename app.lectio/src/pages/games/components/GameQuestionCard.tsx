import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { GameAnswer } from "@/store/gameAnswersStore";
import { AnimatePresence, motion } from "framer-motion";
import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import type {
  BooleanGameQuestion,
  GameQuestion,
  GameType,
  OptionsGameQuestion,
  PerformanceGameQuestion,
  TabooGameQuestion,
} from "../lib/gameTypes";
import { isTimedGameType } from "../lib/gameTypes";
import { PLAYER_COLORS } from "../lib/itoGameUtils";
import { GameRulesHelp } from "./GameRulesHelp";
import { QuestionTimer } from "./QuestionTimer";

type GameQuestionCardProps = {
  type: GameType;
  question: GameQuestion;
  answered: boolean;
  answer: GameAnswer | null;
  selectedOptionIndex: number | null;
  timeLimitSeconds?: number;
  autoStartTimer: boolean;
  groupCount?: number;
  currentQuestionOrderIndex?: number;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  onSelectOption: (index: number) => void;
  onSubmitAnswer: (isCorrect: boolean) => void;
  onTimeExpired: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onShowResults: () => void;
};

const isChoiceGame = (type: GameType) =>
  type === "options" || type === "boolean";

/** Alternativas para jogos de opções e verdadeiro/falso */
function ChoiceOptions({
  question,
  answered,
  answer,
  selectedOptionIndex,
  onSelectOption,
}: Pick<
  GameQuestionCardProps,
  "question" | "answered" | "answer" | "selectedOptionIndex" | "onSelectOption"
>) {
  const choiceQuestion = question as OptionsGameQuestion | BooleanGameQuestion;
  const options = choiceQuestion.options ?? [];

  return (
    <div className="flex flex-col gap-2.5">
      {options.map((option, index) => {
        const isSelected = selectedOptionIndex === index;
        const wasSelected = answered && answer?.answerIndex === index;
        const isCorrectOption = option.isAnswer;

        return (
          <button
            key={index}
            type="button"
            onClick={() => !answered && onSelectOption(index)}
            disabled={answered}
            aria-pressed={isSelected && !answered}
            className={cn(
              "relative w-full rounded-lg border px-4 py-3 text-left text-sm transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-default",
              // Estado padrão
              !answered &&
                !isSelected &&
                "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
              // Selecionado (antes de responder)
              isSelected &&
                !answered &&
                "border-primary bg-primary/10 font-medium",
              // Correto (depois de responder)
              answered && isCorrectOption && "border-success/50 bg-success/10",
              // Selecionado errado (depois de responder)
              answered &&
                wasSelected &&
                !isCorrectOption &&
                "border-destructive/50 bg-destructive/10",
              // Opção neutra após resposta
              answered &&
                !isCorrectOption &&
                !wasSelected &&
                "border-border/50 opacity-50",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex-1 leading-snug">{option.text}</span>
              {answered && isCorrectOption && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              )}
              {answered && wasSelected && !isCorrectOption && (
                <XCircle className="h-4 w-4 shrink-0 text-destructive" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** Botões de autoavaliação para jogos performáticos */
function PerformanceActions({
  question,
  answered,
  answer,
  onSubmitAnswer,
  type,
}: Pick<
  GameQuestionCardProps,
  "type" | "question" | "answered" | "answer" | "onSubmitAnswer"
>) {
  const perfQuestion = question as
    | PerformanceGameQuestion
    | TabooGameQuestion;
  const answerText = "answer" in perfQuestion ? perfQuestion.answer : "";
  const tabooQuestion = type === "taboo" ? (question as TabooGameQuestion) : null;
  const forbiddenWords = tabooQuestion?.forbiddenWords ?? [];

  return (
    <div className="space-y-4">
      {/* Palavra a adivinhar / Palavra secreta */}
      {answerText && (
        <div className="rounded-xl border border-border/80 bg-muted/40 p-4 md:p-5 text-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {type === "taboo" ? "Palavra a adivinhar" : "Palavra Secreta"}
          </p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {answerText}
          </p>
        </div>
      )}

      {/* Palavras proibidas para taboo */}
      {type === "taboo" && forbiddenWords.length > 0 && (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Ban className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wide text-destructive">
              Palavras proibidas (não pode falar!)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {forbiddenWords.map((word) => (
              <Badge
                key={word}
                variant="destructive"
                className="text-xs font-semibold px-2.5 py-1"
              >
                {word}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Instrução e botões */}
      {!answered && (
        <>
          <p className="text-sm text-muted-foreground">
            Realize o desafio e informe o resultado:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onSubmitAnswer(true)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-5 font-semibold",
                "border-success/30 bg-success/5 text-success/70 dark:text-success/80",
                "transition-all hover:border-success/60 hover:bg-success/15 active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2",
              )}
            >
              <ThumbsUp className="h-7 w-7" />
              <span>Acertei</span>
            </button>
            <button
              type="button"
              onClick={() => onSubmitAnswer(false)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-5 font-semibold",
                "border-destructive/30 bg-destructive/5 text-destructive/80",
                "transition-all hover:border-destructive/60 hover:bg-destructive/15 active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2",
              )}
            >
              <ThumbsDown className="h-7 w-7" />
              <span>Errei</span>
            </button>
          </div>
        </>
      )}

      {/* Feedback após resposta performática */}
      {answered && answer && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border p-4",
            answer.isCorrect
              ? "border-success/30 bg-success/10"
              : "border-destructive/30 bg-destructive/10",
          )}
        >
          {answer.isCorrect ? (
            <ThumbsUp className="h-6 w-6 shrink-0 text-success" />
          ) : (
            <ThumbsDown className="h-6 w-6 shrink-0 text-destructive" />
          )}
          <p className="font-semibold">
            {answer.isCorrect ? "Marcado como acerto!" : "Marcado como erro."}
          </p>
        </div>
      )}
    </div>
  );
}

export function GameQuestionCard({
  type,
  question,
  answered,
  answer,
  selectedOptionIndex,
  timeLimitSeconds,
  autoStartTimer,
  groupCount,
  currentQuestionOrderIndex = 0,
  isFirstQuestion,
  isLastQuestion,
  onSelectOption,
  onSubmitAnswer,
  onTimeExpired,
  onPrevious,
  onNext,
  onShowResults,
}: GameQuestionCardProps) {
  const questionText = question?.text?.replace(/\\n/g, "\n");
  const isChoice = isChoiceGame(type);
  const showTimer = isTimedGameType(type) && !!timeLimitSeconds;

  const isMultiGroup = Boolean(groupCount && groupCount > 1);
  const currentGroupIndex = isMultiGroup
    ? currentQuestionOrderIndex % groupCount!
    : 0;
  const currentGroupColor = PLAYER_COLORS[currentGroupIndex % PLAYER_COLORS.length];

  const choiceQuestion = isChoice
    ? (question as OptionsGameQuestion | BooleanGameQuestion)
    : null;
  const answerExplanation = "answer" in question ? (question as { answer?: string }).answer : undefined;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto space-y-3"
    >
      {/* ── Banner de Vez do Grupo/Jogador (quando há mais de 1 grupo) ── */}
      {isMultiGroup && (
        <motion.div
          key={`group-${currentGroupIndex}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-xl border px-4 py-2.5 shadow-sm transition-all"
          style={{
            backgroundColor: currentGroupColor.hiddenBg,
            borderColor: currentGroupColor.hiddenBorder,
            color: currentGroupColor.accentColor,
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="h-3 w-3 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: currentGroupColor.accentColor }}
            />
            <span className="text-sm font-bold">
              Vez de: <span className="underline underline-offset-2">Grupo {currentGroupIndex + 1}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold opacity-90">
            <Users className="h-3.5 w-3.5" />
            <span>Grupo {currentGroupIndex + 1} de {groupCount}</span>
          </div>
        </motion.div>
      )}

      <Card className="overflow-hidden border-primary/15 shadow-lg shadow-primary/5">
        {/* Header: texto da questão */}
        <CardHeader className="border-b bg-muted/20 p-5 md:p-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {isChoice ? "Questão" : "Desafio atual"}
          </p>
          <p className="whitespace-pre-line text-xl font-bold leading-8 text-foreground md:text-2xl">
            {questionText}
          </p>
        </CardHeader>

        <CardContent className="p-5 md:p-7 space-y-5">
          {/* Explicação de como funciona o modo de jogo */}
          {!isChoice && <GameRulesHelp type={type} />}

          {/* Timer (apenas jogos temporizados) */}
          {showTimer && (
            <QuestionTimer
              key={question.id}
              durationSeconds={timeLimitSeconds!}
              disabled={answered}
              autoStart={autoStartTimer}
              onExpire={onTimeExpired}
            />
          )}

          {/* Alternativas ou desafio performático */}
          {isChoice ? (
            <ChoiceOptions
              question={question}
              answered={answered}
              answer={answer}
              selectedOptionIndex={selectedOptionIndex}
              onSelectOption={onSelectOption}
            />
          ) : (
            <PerformanceActions
              type={type}
              question={question}
              answered={answered}
              answer={answer}
              onSubmitAnswer={onSubmitAnswer}
            />
          )}

          {/* Feedback de resposta (jogos de opção) */}
          <AnimatePresence>
            {answered && answer && isChoice && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Separator className="mb-4" />
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4",
                    answer.isCorrect
                      ? "border-success/30 bg-success/10"
                      : "border-destructive/30 bg-destructive/10",
                  )}
                >
                  {answer.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  )}
                  <div>
                    <p className="font-semibold mb-0.5">
                      {answer.isCorrect
                        ? "Resposta correta!"
                        : "Resposta incorreta"}
                    </p>
                    {answerExplanation && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {answerExplanation}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        {/* Footer: navegação e ação principal */}
        <CardFooter className="border-t bg-muted/10 flex items-center justify-between gap-2 p-4 md:p-5">
          {/* Anterior */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={isFirstQuestion}
            aria-label="Questão anterior"
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          {/* Ação central */}
          <div className="flex-1 flex justify-center">
            {answered ? (
              isLastQuestion ? (
                <Button
                  onClick={onShowResults}
                  size="sm"
                  className="gap-1.5 px-5"
                >
                  <Trophy className="h-4 w-4" />
                  Ver resultados
                </Button>
              ) : (
                <Button onClick={onNext} size="sm" className="gap-1.5 px-5">
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )
            ) : isChoice ? (
              <Button
                onClick={() => {
                  const selectedOption =
                    choiceQuestion?.options?.[selectedOptionIndex ?? -1];
                  onSubmitAnswer(selectedOption?.isAnswer ?? false);
                }}
                disabled={selectedOptionIndex === null}
                size="sm"
                className="px-6"
              >
                Responder
              </Button>
            ) : null}
          </div>

          {/* Próxima */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={isLastQuestion || !answered}
            aria-label="Próxima questão"
            className="gap-1.5"
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
