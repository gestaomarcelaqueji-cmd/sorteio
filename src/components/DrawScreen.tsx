import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Cog, RotateCcw, Copy, Camera } from "lucide-react";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { GlassPanel } from "@/components/GlassPanel";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface DrawScreenProps {
  allParticipants: string[];
  winners: string[];
  currentWinnerIndex: number;
  onRevealNext: () => void;
  isComplete: boolean;

  // 🔥 Funções extras
  onBack: () => void; // voltar para participantes
  onBackToSettings: () => void; // voltar para configurações
  onRestart: () => void; // reiniciar sorteio
  onCopyResults: () => void; // copiar texto
  onSaveWinnerImage: () => void; // salvar PNG
  onRerollWinner: (index: number) => void; // re-sortear este vencedor
  auditLog?: any;
}

export function DrawScreen({
  allParticipants,
  winners,
  currentWinnerIndex,
  onRevealNext,
  isComplete,
  onBack,
  onBackToSettings,
  onRestart,
  onCopyResults,
  onSaveWinnerImage,
  onRerollWinner,
}: DrawScreenProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [slotIndex, setSlotIndex] = useState(0); // índice central da roleta

  const { playSlotAmbience, playWinnerReveal, playConfetti } = useSoundEffects();

  const currentWinner = winners[currentWinnerIndex];
  const revealedWinners = winners.slice(0, currentWinnerIndex);

  /* ============================================================
     ANIMAÇÃO PRINCIPAL (som + tempo até revelar)
  ============================================================ */
  useEffect(() => {
    if (!currentWinner || allParticipants.length === 0) return;

    setIsAnimating(true);
    setShowConfetti(false);
    setSlotIndex(0); // reseta posição da roleta
    playSlotAmbience();

    const timer = setTimeout(() => {
      setIsAnimating(false);
      setShowConfetti(true);
      playWinnerReveal();
      setTimeout(() => playConfetti(), 200);
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentWinnerIndex, currentWinner, allParticipants.length, playSlotAmbience, playWinnerReveal, playConfetti]);

  /* ============================================================
     Fallback: nunca deixa a tela vazia
  ============================================================ */
  if (!currentWinner || allParticipants.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center text-muted-foreground">
        Preparando resultado...
      </div>
    );
  }

  /* ============================================================
     Lista base para a roleta (duplicada pra não dar “buraco”)
  ============================================================ */
  const loopNames =
    allParticipants.length === 1
      ? [...allParticipants, ...allParticipants, ...allParticipants]
      : [...allParticipants, ...allParticipants];

  /* ============================================================
     Roleta: atualiza o índice central enquanto estiver animando
  ============================================================ */
  useEffect(() => {
    if (!isAnimating) return;
    if (loopNames.length === 0) return;

    // velocidade da troca de nomes (ms)
    const speed = 90;

    const interval = setInterval(() => {
      setSlotIndex((prev) => (prev + 1) % loopNames.length);
    }, speed);

    return () => clearInterval(interval);
  }, [isAnimating, loopNames.length]);

  const len = loopNames.length;
  const center = slotIndex % len;

  const visibleNames = [
    loopNames[(center - 1 + len) % len],
    loopNames[center],
    loopNames[(center + 1) % len],
  ];

  /* ============================================================
     RENDER
  ============================================================ */
  return (
  <div
    className="
      fixed inset-0 
      flex flex-col items-center justify-center 
      p-8 
      overflow-hidden 
      noise-bg
      bg-[url('/fundo.png')] bg-cover bg-center bg-no-repeat
    "
  >
    {showConfetti && <ConfettiEffect />}

      {/* CABEÇALHO */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-b from-neon-green to-neon-emerald bg-clip-text text-transparent">
          Resultado do Sorteio
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          {isComplete
            ? "Todos os ganhadores revelados!"
            : `Ganhador ${currentWinnerIndex + 1} de ${winners.length}`}
        </p>
      </motion.div>

      {/* FASE 1 — EMBARALHANDO */}
      {isAnimating && (
        <div className="flex flex-col items-center w-full max-w-3xl">
          <p className="text-base md:text-lg text-muted-foreground mb-6">
            Embaralhando os nomes...
          </p>

          <div className="relative h-56 w-full flex items-center justify-center overflow-hidden">
            {visibleNames.map((name, i) => {
              const isCenter = i === 1;
              const translateY = i === 0 ? -40 : i === 1 ? 0 : 40;

              return (
                <motion.div
                  key={`${name}-${i}`}
                  className={`absolute font-bold text-neon-green ${
                    isCenter
                      ? "text-4xl md:text-5xl opacity-100"
                      : "text-3xl md:text-4xl opacity-35"
                  }`}
                  style={{
                    transform: `translateY(${translateY}px) scale(${
                      isCenter ? 1 : 0.8
                    })`,
                    transition: "transform 0.18s linear, opacity 0.18s linear",
                  }}
                >
                  {name.toUpperCase()}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* FASE 2 — RESULTADO */}
      {!isAnimating && (
        <>
          <p className="text-base md:text-lg text-center mb-4 text-muted-foreground">
            Ganhador:
          </p>

          <div
            id="winner-card"
            className="relative h-40 md:h-48 flex items-center justify-center mb-6"
          >
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-neon-green bg-clip-text text-transparent"
            >
              {currentWinner.toUpperCase()}
            </motion.span>
          </div>

          <GlassPanel className="border border-neon-green/20 rounded-xl mb-6">
            <div className="flex items-center justify-center gap-3 py-3">
              <Trophy className="w-6 h-6 text-neon-green" />
              <span className="text-xl font-semibold">{currentWinner}</span>
              <Trophy className="w-6 h-6 text-neon-green" />
            </div>
          </GlassPanel>
        </>
      )}

      {/* GANHADORES ANTERIORES */}
      {revealedWinners.length > 0 && (
        <GlassPanel className="w-full max-w-5xl mb-6">
          <h3 className="text-sm mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-neon-green" /> Ganhadores anteriores
          </h3>
          <div className="flex flex-wrap gap-2">
            {revealedWinners.map((w, i) => (
              <div
                key={i}
                className="px-3 py-1.5 rounded-md bg-black/40 border border-neon-green/30 text-xs"
              >
                {i + 1}. {w}
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* AÇÕES */}
      {!isAnimating && (
        <div className="flex flex-wrap gap-4 justify-center">
          {/* VOLTAR HOME */}
          <Button
            variant="outline"
            onClick={() => {
              setShowConfetti(false);
              onBack();
            }}
            className="h-11 px-6 border-neon-green/40"
          >
            Voltar
          </Button>

          {/* CONFIGURAÇÕES */}
          <Button
            variant="outline"
            onClick={onBackToSettings}
            className="h-11 px-6 border-neon-green/40"
          >
            <Cog className="w-4 h-4 mr-2" /> Ajustar Configurações
          </Button>

          {/* REINICIAR */}
          <Button
            variant="outline"
            onClick={onRestart}
            className="h-11 px-6 border-neon-green/40"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Reiniciar Sorteio
          </Button>

          {/* RE-SORTEAR ESSE PRÊMIO */}
          <Button
            variant="outline"
            onClick={() => onRerollWinner(currentWinnerIndex)}
            className="h-11 px-6 border-neon-green/40"
          >
            🔁 Re-sortear prêmio
          </Button>

          {/* COPIAR RESULTADO */}
          <Button
            onClick={onCopyResults}
            className="h-11 px-6 bg-neon-green font-bold"
          >
            <Copy className="w-4 h-4 mr-2" /> Copiar resultado
          </Button>

          {/* SALVAR IMAGEM */}
          <Button
            onClick={onSaveWinnerImage}
            className="h-11 px-6 bg-neon-emerald font-bold"
          >
            <Camera className="w-4 h-4 mr-2" /> Salvar imagem
          </Button>

          {/* PRÓXIMO GANHADOR */}
          {!isComplete && (
            <Button
              onClick={onRevealNext}
              className="h-11 px-10 bg-gradient-to-r from-neon-green via-neon-emerald to-neon-teal text-background"
            >
              Revelar próximo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
