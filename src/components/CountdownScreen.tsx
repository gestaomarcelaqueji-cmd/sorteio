import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface CountdownScreenProps {
  onComplete: () => void;
  duration?: number;          // novo: tempo configurável
  silentMode?: boolean;       // novo: modo silencioso
  dramaticMode?: boolean;     // novo: efeitos extras
  shuffleSpeed?: string;      // novo: influência leve na animação
}

export function CountdownScreen({
  onComplete,
  duration = 3,
  silentMode = false,
  dramaticMode = false,
  shuffleSpeed = "normal",
}: CountdownScreenProps) {

  const [count, setCount] = useState(duration);
  const { playCountdownBeep } = useSoundEffects();

  /* ============================================================
     CALIBRAR VELOCIDADE VISUAL DA ANIMAÇÃO
  ============================================================ */
  const scaleSpeed =
    shuffleSpeed === "slow" ? 1.3 :
    shuffleSpeed === "fast" ? 0.8 :
    shuffleSpeed === "hyper" ? 0.55 :
    1;

  /* ============================================================
     CONTAGEM E SONS
  ============================================================ */
  useEffect(() => {
    if (count === 0) {
      setTimeout(onComplete, dramaticMode ? 650 : 350);
      return;
    }

    if (!silentMode) playCountdownBeep(count);

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete, playCountdownBeep, silentMode, dramaticMode]);

  /* ============================================================
     FLASH DRAMÁTICO NO FINAL
  ============================================================ */
  const dramaticFlash =
    dramaticMode && count === 1 ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 bg-white/40 pointer-events-none"
      />
    ) : null;

  /* ============================================================
     RETURN
  ============================================================ */

  return (
  <div
    className="
      fixed inset-0 
      flex items-center justify-center 
      overflow-hidden 
      noise-bg
      bg-[url('/fundo.png')] bg-cover bg-center bg-no-repeat
    "
  >
    {dramaticFlash}

      {/* ============================
          Particle background elegante
      ============================ */}
      <div className="absolute inset-0">
        {[...Array(26)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[3px] h-[3px] bg-neon-green rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              opacity: [0, 0.7, 0],
              scale: [0.7, 2, 0.7],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* ============================
          NÚMERO DA CONTAGEM
      ============================ */}
      {count > 0 && (
        <motion.div
          key={count}
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{
            scale: [0.2, 1.25 * scaleSpeed, 1],
            opacity: [0, 1, 1],
          }}
          exit={{ scale: 1, opacity: 0 }}
          transition={{
            duration: 0.9 * scaleSpeed,
            ease: "easeOut",
          }}
          className="relative"
        >
          <div className="text-[18rem] md:text-[22rem] font-extrabold bg-gradient-to-b from-neon-green to-neon-emerald bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,255,133,0.3)]">
            {count}
          </div>

          {/* Glow animado */}
          <motion.div
            className="absolute inset-0 text-[18rem] md:text-[22rem] font-extrabold text-neon-green/50 blur-3xl"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {count}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
