import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Ban,
  BookOpen,
  ChevronDown,
  HelpCircle,
  KeyRound,
  PersonStanding,
  SlidersHorizontal,
  Type,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { gameTypeBadgeColors, getGameTypeRules } from "../lib/gameConfig";
import type { GameType } from "../lib/gameTypes";

const gameTypeIcons: Record<string, React.ElementType> = {
  charades: PersonStanding,
  one_word: Type,
  taboo: Ban,
  ito: SlidersHorizontal,
  just_one: KeyRound,
  spy: UserX,
};

type GameRulesHelpProps = {
  type: GameType;
  defaultOpen?: boolean;
  className?: string;
};

export function GameRulesHelp({
  type,
  defaultOpen = false,
  className,
}: GameRulesHelpProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const ruleInfo = getGameTypeRules(type);

  if (!ruleInfo) return null;

  const IconComponent = gameTypeIcons[type] ?? BookOpen;
  const badgeColor =
    gameTypeBadgeColors[type] ??
    "border-primary/30 bg-primary/10 text-primary";

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card/60 transition-all",
        isOpen && "border-primary/30 bg-primary/[0.02]",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 p-3.5 text-left text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary shrink-0" />
          <span>Como funciona este jogo? ({ruleInfo.badge})</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border/50"
          >
            <div className="p-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("gap-1 px-2.5 py-0.5", badgeColor)}>
                  <IconComponent className="h-3.5 w-3.5" />
                  <span>{ruleInfo.title}</span>
                </Badge>
              </div>

              <p className="text-foreground/90 font-medium leading-relaxed">
                {ruleInfo.summary}
              </p>

              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Regras da rodada:
                </p>
                <ul className="space-y-1.5 pl-1">
                  {ruleInfo.rules.map((rule, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                    >
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
