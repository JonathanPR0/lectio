export function playTimerAlert() {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) return;

  const context = new AudioContextClass();

  // Resume context if suspended by browser autoplay policy
  if (context.state === "suspended") {
    context.resume();
  }

  // Padrão de alarme estilo despertador digital / timer de celular:
  // 3 blocos de bips triplos rápidos e penetrantes ("BIP-BIP-BIP ... BIP-BIP-BIP ... BIP-BIP-BIP")
  const beepGroups = 10;
  const beepsPerGroup = 3;
  const beepDuration = 0.085; // Duração de cada bip
  const beepInterval = 0.14;  // Intervalo entre bips do mesmo bloco
  const groupInterval = 0.62; // Intervalo entre blocos

  const primaryFreq = 1046.5; // C6 (agudo, penetrante e claro)
  const harmonicFreq = 2093.0; // C7 (harmônico para dar presença de alarme de celular)

  for (let g = 0; g < beepGroups; g++) {
    const groupStartTime = g * groupInterval;

    for (let b = 0; b < beepsPerGroup; b++) {
      const startTime = context.currentTime + groupStartTime + b * beepInterval;
      const stopTime = startTime + beepDuration;

      // Oscilador principal
      const osc1 = context.createOscillator();
      const osc2 = context.createOscillator();
      const gain = context.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(primaryFreq, startTime);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(harmonicFreq, startTime);

      // Envelope rápido e percussivo de despertador
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.008);
      gain.gain.setValueAtTime(0.35, stopTime - 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(context.destination);

      osc1.start(startTime);
      osc1.stop(stopTime);
      osc2.start(startTime);
      osc2.stop(stopTime);
    }
  }

  const totalDuration = beepGroups * groupInterval + 0.2;

  // Fecha o AudioContext ao término do alarme
  setTimeout(() => {
    context.close().catch(() => {});
  }, totalDuration * 1000);
}


