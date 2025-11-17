import { useCallback, useRef } from "react";

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Som de contagem regressiva - beep futurístico crescente
  const playCountdownBeep = useCallback((count: number) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Frequências crescentes: 3=400Hz, 2=600Hz, 1=800Hz
    const frequency = 200 + (4 - count) * 200;

    // Oscilador principal
    const oscillator = ctx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + 0.1);

    // Oscilador secundário para harmônico
    const oscillator2 = ctx.createOscillator();
    oscillator2.type = "square";
    oscillator2.frequency.setValueAtTime(frequency * 2, now);

    // Ganho principal
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    // Ganho secundário
    const gainNode2 = ctx.createGain();
    gainNode2.gain.setValueAtTime(0.1, now);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    // Filtro para dar brilho neon
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, now);
    filter.Q.setValueAtTime(5, now);

    // Conectar tudo
    oscillator.connect(gainNode);
    oscillator2.connect(gainNode2);
    gainNode.connect(filter);
    gainNode2.connect(filter);
    filter.connect(ctx.destination);

    // Iniciar e parar
    oscillator.start(now);
    oscillator2.start(now);
    oscillator.stop(now + 0.15);
    oscillator2.stop(now + 0.15);

    console.log(`🔊 Countdown beep: ${count} (${frequency}Hz)`);
  }, [getAudioContext]);

  // Som de "woosh" para slot machine girando
  const playSlotSpin = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Ruído branco filtrado para efeito de giro
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filtro passa-banda para criar efeito de velocidade
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(1500, now + 0.3);
    filter.Q.setValueAtTime(10, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.3);

    console.log("🔊 Slot spin sound");
  }, [getAudioContext]);

  // Som de revelação do ganhador - explosão sintética
  const playWinnerReveal = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Oscilador 1: Sweep ascendente
    const osc1 = ctx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(100, now);
    osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.4);

    // Oscilador 2: Harmônico
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(200, now);
    osc2.frequency.exponentialRampToValueAtTime(2400, now + 0.4);

    // Ruído branco para impacto inicial
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Ganhos
    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.15, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    // Filtro para brilho
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(300, now);

    // Compressor para evitar clipping
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-20, now);
    compressor.ratio.setValueAtTime(12, now);

    // Conexões
    osc1.connect(gain1);
    osc2.connect(gain2);
    noise.connect(noiseGain);
    
    gain1.connect(filter);
    gain2.connect(filter);
    noiseGain.connect(filter);
    
    filter.connect(compressor);
    compressor.connect(ctx.destination);

    // Iniciar
    osc1.start(now);
    osc2.start(now);
    noise.start(now);
    
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
    noise.stop(now + 0.1);

    console.log("🔊 Winner reveal sound");
  }, [getAudioContext]);

  // Som de confete - sparkle celebratório
  const playConfetti = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Criar vários "sparkles" em sequência rápida
    for (let i = 0; i < 8; i++) {
      const delay = i * 0.05;
      const frequency = 800 + Math.random() * 1200;

      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, now + delay);
      osc.frequency.exponentialRampToValueAtTime(frequency * 2, now + delay + 0.08);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.08);
    }

    console.log("🔊 Confetti sparkle");
  }, [getAudioContext]);

  // Som de clique/transição suave
  const playClick = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);

    console.log("🔊 Click sound");
  }, [getAudioContext]);

  // Som ambiente para animação de slot
  const playSlotAmbience = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 3;

    // Tom crescente de tensão
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(40, now);
    osc.frequency.linearRampToValueAtTime(60, now + duration);

    // Modulação para dar movimento
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(8, now);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(20, now);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
    gain.gain.setValueAtTime(0.08, now + duration - 0.5);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    lfo.start(now);
    osc.stop(now + duration);
    lfo.stop(now + duration);

    console.log("🔊 Slot ambience (3s)");
  }, [getAudioContext]);

  return {
    playCountdownBeep,
    playSlotSpin,
    playWinnerReveal,
    playConfetti,
    playClick,
    playSlotAmbience,
  };
}
