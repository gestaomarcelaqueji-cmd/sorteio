import { useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, ArrowLeft, Play, Sparkles, VolumeX, Timer, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassPanel } from "@/components/GlassPanel";
import { RaffleSettings as RaffleSettingsType } from "@/types/raffle";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface RaffleSettingsProps {
  settings: RaffleSettingsType;
  onUpdateSettings: (settings: RaffleSettingsType) => void;
  onBack: () => void;
  onStart: () => void;
  participantsCount: number;
}

export function RaffleSettings({
  settings,
  onUpdateSettings,
  onBack,
  onStart,
  participantsCount,
}: RaffleSettingsProps) {
  const { playClick } = useSoundEffects();

  // Ajustes automáticos de segurança
  useEffect(() => {
    if (participantsCount > 0 && settings.winnersCount > participantsCount) {
      onUpdateSettings({
        ...settings,
        winnersCount: participantsCount,
      });
    }

    if (participantsCount === 0 && settings.winnersCount !== 0) {
      onUpdateSettings({
        ...settings,
        winnersCount: 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantsCount]);

  const handleStart = () => {
    if (participantsCount === 0) {
      toast.error("Adicione pelo menos 1 participante");
      return;
    }

    if (settings.winnersCount === 0) {
      toast.error("Selecione ao menos 1 ganhador");
      return;
    }

    if (settings.winnersCount > participantsCount) {
      toast.error("Ganhadores não podem exceder participantes");
      return;
    }

    playClick();
    onStart();
  };

  const canStart =
    participantsCount > 0 &&
    settings.winnersCount > 0 &&
    settings.winnersCount <= participantsCount;

  const shuffleSpeed = settings.shuffleSpeed ?? "normal";
  const countdownDuration = settings.countdownDuration ?? 3;
  const dramaticMode = !!settings.dramaticMode;
  const silentMode = !!settings.silentMode;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto space-y-10"
    >
      {/* Título */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Settings className="w-9 h-9 text-neon-green drop-shadow-[0_0_12px_rgba(0,255,133,0.45)]" />
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-b from-neon-green to-neon-emerald bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(0,255,133,0.45)]">
            Configurações do Sorteio
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {participantsCount === 0
            ? "Nenhum participante"
            : `${participantsCount} participante${participantsCount !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Painel de configurações avançadas */}
      <GlassPanel className="border border-neon-green/20 rounded-xl p-6 space-y-8">
        {/* Quantidade de ganhadores */}
        <div className="space-y-2">
          <Label className="text-base">Quantidade de ganhadores</Label>

          <Select
            value={settings.winnersCount === 0 ? "" : settings.winnersCount.toString()}
            onValueChange={(value) =>
              onUpdateSettings({ ...settings, winnersCount: parseInt(value) })
            }
            disabled={participantsCount === 0}
          >
            <SelectTrigger className="h-11 text-sm bg-black/40 border-neon-green/25">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-neon-green/25">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem
                  key={num}
                  value={num.toString()}
                  disabled={num > participantsCount}
                  className="text-sm"
                >
                  {num} ganhador{num !== 1 ? "es" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Repetição de ganhadores */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-black/40 border border-neon-green/10">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Permitir repetição</Label>
            <p className="text-xs text-muted-foreground">
              Ganhadores continuam elegíveis em novos sorteios.
            </p>
          </div>

          <Switch
            checked={settings.allowRepeatWinners}
            onCheckedChange={(checked) =>
              onUpdateSettings({ ...settings, allowRepeatWinners: checked })
            }
            className="data-[state=checked]:bg-neon-green"
          />
        </div>
      </GlassPanel>

      {/* Ações finais */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => {
            playClick();
            onBack();
          }}
          variant="outline"
          size="lg"
          className="flex-1 h-11 border-neon-green/40 hover:bg-neon-green/10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>

        <Button
          onClick={handleStart}
          disabled={!canStart}
          size="lg"
          className="flex-1 h-11 bg-gradient-to-r from-neon-green via-neon-emerald to-neon-teal hover:opacity-90 font-bold text-base shadow-lg shadow-neon-green/30 disabled:opacity-40"
        >
          <Play className="w-5 h-5 mr-2" />
          Iniciar contagem
        </Button>
      </div>
    </motion.div>
  );
}
