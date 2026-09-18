import { useEffect, useRef, useState } from "react";

type UseQuestionTimerProps = {
  durationSeconds: number;
  enabled: boolean;
  onExpire: () => void;
};

export function useQuestionTimer({
  durationSeconds,
  enabled,
  onExpire,
}: UseQuestionTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const expiredRef = useRef(false);

  // Reiniciar quando a duração mudar (troca de questão)
  useEffect(() => {
    setIsRunning(false);
    setRemainingSeconds(durationSeconds);
    expiredRef.current = false;
  }, [durationSeconds]);

  useEffect(() => {
    if (!enabled || !isRunning) return;

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(intervalId);
          setIsRunning(false);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire();
          }
          return 0;
        }
        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [enabled, isRunning, onExpire]);

  const start = () => {
    if (enabled && remainingSeconds > 0 && !expiredRef.current) {
      setIsRunning(true);
    }
  };

  const isExpired = expiredRef.current || remainingSeconds === 0;

  return { isRunning, remainingSeconds, isExpired, start };
}
