import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Users, Plus, Upload, Download, Shuffle, ListChecks, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassPanel } from "@/components/GlassPanel";
import { toast } from "sonner";
import { LastRaffleConfig } from "@/types/raffle";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface ParticipantsManagerProps {
  participants: string[];
  onAddParticipant: (name: string) => void;
  onRemoveParticipant: (index: number) => void;
  onClearAll: () => void;
  onLoadExample: () => void;
  onNext: () => void;
  lastRaffle: LastRaffleConfig | null;
  onUseSameList: () => void;
  onClearHistory: () => void;
}

export function ParticipantsManager({
  participants,
  onAddParticipant,
  onRemoveParticipant,
  onClearAll,
  onLoadExample,
  onNext,
  lastRaffle,
  onUseSameList,
  onClearHistory,
}: ParticipantsManagerProps) {
  const [inputValue, setInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { playClick } = useSoundEffects();

  /* ================================================================
     FUNÇÕES NOVAS
  ================================================================= */

  // Adicionar vários nomes colados ao mesmo tempo
  const handlePasteMultiple = () => {
    const lines = inputValue
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length <= 1) return handleAdd();

    let added = 0;
    lines.forEach((name) => {
      if (!participants.includes(name)) {
        onAddParticipant(name);
        added++;
      }
    });

    playClick();
    toast.success(`${added} nomes adicionados`);
    setInputValue("");
  };

  const handleImportFile = async (file?: File) => {
  const selectedFile = file || fileInputRef.current?.files?.[0];
  if (!selectedFile) return;

  const text = await selectedFile.text();

  const names = text
    .split(/\r?\n|,|;/)                      // quebra universal
    .map((line) =>
      line
        .replace(/^\d+[\.\)\-]\s*/, "")       // remove “1. Fulano”
        .trim()
    )
    .filter(Boolean);

  if (!names.length) {
    toast.error("Nenhum nome válido encontrado no arquivo");
    return;
  }

  let added = 0;

  names.forEach((name) => {
    if (!participants.includes(name)) {
      onAddParticipant(name);
      added++;
    }
  });

  toast.success(`${added} nomes importados`);
};


  // Exportar lista como TXT
  const handleExportList = () => {
    const blob = new Blob([participants.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "lista-participantes.txt";
    a.click();

    toast.success("Lista exportada");
  };

  // Ordenar A–Z / Z–A
  const handleSort = (direction: "asc" | "desc") => {
    const sorted = [...participants].sort((a, b) =>
      direction === "asc" ? a.localeCompare(b) : b.localeCompare(a)
    );

    sorted.forEach((n) => onRemoveParticipant(0));
    sorted.forEach((n) => onAddParticipant(n));

    toast.success(direction === "asc" ? "Ordenado A-Z" : "Ordenado Z-A");
  };

  // Remover duplicados rapidamente
  const handleRemoveDuplicates = () => {
    const unique = [...new Set(participants)];
    if (unique.length === participants.length) {
      toast.info("Nenhum duplicado encontrado");
      return;
    }

    onClearAll();
    unique.forEach(onAddParticipant);
    toast.success("Duplicados removidos");
  };

  // Embaralhar lista inteira (shuffle Fisher-Yates)
  const handleShuffleList = () => {
    const arr = [...participants];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    onClearAll();
    arr.forEach(onAddParticipant);
    playClick();

    toast.success("Lista embaralhada");
  };

  // Adicionar nome único
  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return toast.error("Nome não pode estar vazio");

    if (participants.includes(trimmed))
      return toast.error("Este nome já está na lista");

    onAddParticipant(trimmed);
    playClick();
    toast.success(`${trimmed} adicionado`);
    setInputValue("");
  };

  /* ================================================================
      UI
  ================================================================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto space-y-10"
    >
      {/* ---------------------- TÍTULO ---------------------- */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-b from-neon-green to-neon-emerald bg-clip-text text-transparent">
          Lista de Participantes
        </h1>
        <p className="text-sm text-muted-foreground">
          Adicione nomes para o sorteio
        </p>
      </div>

      {/* ---------------------- ÚLTIMO SORTEIO ---------------------- */}
      {lastRaffle && (
        <GlassPanel className="border border-neon-green/20 p-6 rounded-xl shadow-lg shadow-black/40">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neon-green">Último Sorteio</h3>
              <span className="text-xs opacity-70">
                {new Date(lastRaffle.timestamp).toLocaleString("pt-BR")}
              </span>
            </div>

            <div className="flex gap-6 text-sm opacity-80">
              <span>Participantes: <b>{lastRaffle.totalParticipants}</b></span>
              <span>Ganhadores: <b>{lastRaffle.winnersCount}</b></span>
            </div>

            <div>
              <p className="text-xs opacity-70 mb-1">Vencedores:</p>
              <div className="flex flex-wrap gap-2">
                {lastRaffle.winners.map((winner, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-md bg-neon-green/10 border border-neon-green/40 text-xs"
                  >
                    {winner}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={onUseSameList}
                variant="outline"
                className="flex-1 border-neon-green/40 hover:bg-neon-green/10 text-sm"
              >
                Usar mesma lista
              </Button>

              <Button
                onClick={onClearHistory}
                variant="outline"
                className="flex-1 border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm"
              >
                Limpar histórico
              </Button>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* ---------------------- INPUT + AÇÕES ---------------------- */}
      <GlassPanel className="border border-neon-green/20 p-6 rounded-xl">
        <div className="space-y-3">
          <Label className="text-base">Adicionar participantes</Label>

          <div className="flex gap-3 flex-col sm:flex-row">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (inputValue.includes("\n") ? handlePasteMultiple() : handleAdd())
              }
              placeholder="Digite ou cole vários nomes..."
              className="flex-1 h-11 text-base bg-black/40 border-neon-green/20"
            />

            <Button
              onClick={inputValue.includes("\n") ? handlePasteMultiple : handleAdd}
              className="h-11 px-6 bg-gradient-to-r from-neon-emerald to-neon-green font-semibold"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {/* Ações extras */}
          <div className="flex flex-wrap gap-3 pt-3">
            <Button
              variant="outline"
              className="border-neon-green/40 hover:bg-neon-green/10 text-xs sm:text-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-1" />
              Importar TXT/CSV
            </Button>

            <Button
              variant="outline"
              className="border-neon-green/40 hover:bg-neon-green/10 text-xs sm:text-sm"
              onClick={handleExportList}
            >
              <Download className="w-4 h-4 mr-1" />
              Exportar lista
            </Button>

          </div>

          {/* Input invisível para arquivos */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".txt,.csv"
            className="hidden"
            onChange={(e) => handleImportFile(e.target.files?.[0])}
          />
        </div>
      </GlassPanel>

      {/* ---------------------- LISTA DE PARTICIPANTES ---------------------- */}
      <GlassPanel className="border border-neon-green/15 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-neon-green" />
            Participantes ({participants.length})
          </h3>
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            Nenhum participante adicionado
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
            <AnimatePresence>
              {participants.map((name, i) => (
                <motion.div
                  key={`${name}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-black/40 border border-neon-green/15 hover:border-neon-green/40 transition-all"
                >
                  <span className="text-sm font-medium">{name}</span>
                  <button
                    onClick={() => onRemoveParticipant(i)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </GlassPanel>

      {/* ---------------------- AÇÕES FINAIS ---------------------- */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <Button
          onClick={onClearAll}
          variant="outline"
          disabled={participants.length === 0}
          className="flex-1 border-red-500/40 text-red-400 hover:bg-red-500/10 h-11"
        >
          Limpar lista
        </Button>

        <Button
          onClick={onLoadExample}
          variant="outline"
          className="flex-1 border-neon-green/40 hover:bg-neon-green/10 h-11"
        >
          Carregar nomes de exemplo
        </Button>

        <Button
          onClick={onNext}
          disabled={participants.length === 0}
          className="flex-1 h-11 bg-gradient-to-r from-neon-green to-neon-emerald hover:opacity-90 font-bold shadow-lg shadow-neon-green/30"
        >
          Avançar para sorteio
        </Button>
      </div>
    </motion.div>
  );
}
