import { motion } from "framer-motion";
import { Trophy, RotateCcw, Home, Copy, Camera, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/GlassPanel";

interface FinishedScreenProps {
  winners: string[];
  onNewRaffleSameList: () => void;
  onBackToParticipants: () => void;

  // 🔥 Novas funções
  onCopyResults: () => void;
  onSaveWinnerImage: () => void;
  onRerollWinner: (index: number) => void;
  auditLog?: any;
}

export function FinishedScreen({
  winners,
  onNewRaffleSameList,
  onBackToParticipants,
  onCopyResults,
  onSaveWinnerImage,
  onRerollWinner,
  auditLog,
}: FinishedScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      {/* Cabeçalho */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.7 }}
        >
          <Trophy className="w-16 h-16 text-neon-green mx-auto mb-2 drop-shadow-[0_0_15px_rgba(0,255,133,0.5)]" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-b from-neon-green to-neon-emerald bg-clip-text text-transparent">
          Sorteio Concluído
        </h1>

        <p className="text-sm md:text-base text-muted-foreground">
          Parabéns aos ganhadores!
        </p>
      </div>

      {/* Lista de vencedores */}
      <GlassPanel className="border border-neon-green/20 rounded-xl p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2 justify-center">
          <Trophy className="w-5 h-5 text-neon-green" />
          Vencedores
        </h2>

        <div className="space-y-3">
          {winners.map((winner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 px-4 py-3 rounded-lg bg-black/40 border border-neon-green/15"
            >
              {/* Número */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-neon-green to-neon-emerald flex items-center justify-center text-background font-semibold text-base">
                {index + 1}
              </div>

              {/* Nome */}
              <span className="text-sm md:text-base font-medium flex-1">
                {winner}
              </span>

              {/* Re-sortear específico */}
              <button
                onClick={() => onRerollWinner(index)}
                className="text-neon-green/80 hover:text-neon-green transition-colors"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>

              <Trophy className="w-5 h-5 text-neon-green/60" />
            </motion.div>
          ))}
        </div>
      </GlassPanel>

      {/* Auditoria */}
      {auditLog && (
        <GlassPanel className="border border-neon-green/15 rounded-xl p-4 text-xs text-muted-foreground">
          <p>
            <strong>Seed:</strong> {auditLog.seed}
          </p>
          <p>
            <strong>Data:</strong>{" "}
            {new Date(auditLog.timestamp).toLocaleString("pt-BR")}
          </p>
          <p>
            <strong>Participantes:</strong> {auditLog.participants.length}
          </p>
          <p>
            <strong>Ganhadores:</strong> {auditLog.winners.length}
          </p>
        </GlassPanel>
      )}

      {/* Ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Button
          onClick={onNewRaffleSameList}
          size="lg"
          className="h-14 md:h-16 text-base bg-gradient-to-r from-neon-green via-neon-emerald to-neon-teal hover:opacity-90 text-background font-semibold shadow-lg shadow-neon-green/30"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Novo sorteio com mesmos participantes
        </Button>

        <Button
          onClick={onBackToParticipants}
          variant="outline"
          size="lg"
          className="h-14 md:h-16 text-base border-neon-green/40 hover:bg-neon-green/10 font-medium"
        >
          <Home className="w-5 h-5 mr-2" />
          Voltar para lista
        </Button>

        {/* Copiar resultado */}
        <Button
          onClick={onCopyResults}
          size="lg"
          className="col-span-full h-14 bg-neon-green text-background font-bold hover:opacity-90 shadow-inner shadow-neon-green/40"
        >
          <Copy className="w-5 h-5 mr-2" />
          Copiar resultado
        </Button>

        {/* Salvar imagem */}
        <Button
          onClick={onSaveWinnerImage}
          size="lg"
          className="col-span-full h-14 bg-neon-emerald text-background font-bold hover:opacity-90 shadow-inner shadow-neon-green/40"
        >
          <Camera className="w-5 h-5 mr-2" />
          Salvar imagem dos vencedores
        </Button>
      </div>
    </motion.div>
  );
}
