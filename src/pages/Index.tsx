import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ParticipantsManager } from "@/components/ParticipantsManager";
import { RaffleSettings } from "@/components/RaffleSettings";
import { CountdownScreen } from "@/components/CountdownScreen";
import { DrawScreen } from "@/components/DrawScreen";
import { FinishedScreen } from "@/components/FinishedScreen";
import { toast } from "sonner";
import {
  loadStateFromStorage,
  saveParticipantsToStorage,
  saveLastRaffleToStorage,
  clearParticipantsFromStorage,
  clearLastRaffleFromStorage,
} from "@/utils/storageUtils";
import { drawWinners } from "@/utils/raffleUtils";
import {
  RaffleState,
  RaffleSettings as RaffleSettingsType,
} from "@/types/raffle";
import html2canvas from "html2canvas";

const EXAMPLE_NAMES = [
  "Ana Silva",
  "Bruno Costa",
  "Carla Mendes",
  "Daniel Santos",
  "Eduarda Lima",
  "Felipe Oliveira",
  "Gabriela Souza",
  "Henrique Alves",
  "Isabela Rocha",
  "João Pereira",
  "Larissa Martins",
  "Matheus Ferreira",
];

const Index = () => {
  const [state, setState] = useState<RaffleState>("participants");
  const [participants, setParticipants] = useState<string[]>([]);
  const [settings, setSettings] = useState<RaffleSettingsType>({
    winnersCount: 1,
    allowRepeatWinners: true,
    shuffleSpeed: "normal",
    countdownDuration: 3,
    dramaticMode: false,
    silentMode: false,
  });
  const [winners, setWinners] = useState<string[]>([]);
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(0);
  const [seed, setSeed] = useState<string>("");
  const [auditLog, setAuditLog] = useState<any | null>(null);
  const [storageState, setStorageState] = useState(loadStateFromStorage());

  // Normaliza nome (capitalização bonitinha)
  const normalizeName = (name: string) =>
    name
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase()
      .replace(/(^\w{1})|(\s+\w{1})/g, (l) => l.toUpperCase());

  // Carrega do storage ao montar
  useEffect(() => {
    const loaded = loadStateFromStorage();
    setStorageState(loaded);
    if (loaded.participants.length > 0) {
      setParticipants(loaded.participants);
    }
  }, []);

  // Salva participantes quando estiver na tela de participantes
  useEffect(() => {
    if (state === "participants") {
      saveParticipantsToStorage(participants);
    }
  }, [participants, state]);

  const handleAddParticipant = (name: string) => {
  const normalized = normalizeName(name);

  if (!normalized.trim()) {
    toast.error("Nome inválido");
    return;
  }

  setParticipants((prev) => {
    // evita duplicados usando o estado mais recente
    if (prev.includes(normalized)) {
      toast.error("Este nome já está na lista");
      return prev;
    }
    return [...prev, normalized];
  });
};


  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    if (confirm("Tem certeza que deseja limpar toda a lista?")) {
      setParticipants([]);
      clearParticipantsFromStorage();
      toast.success("Lista limpa");
    }
  };

  const handleLoadExample = () => {
    setParticipants(EXAMPLE_NAMES.map(normalizeName));
    toast.success("Nomes de exemplo carregados");
  };

  const handleUseSameList = () => {
    if (storageState.lastRaffle) {
      toast.info("Lista utilizada no último sorteio carregada");
      setParticipants(storageState.lastRaffle.winners);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Tem certeza que deseja limpar o histórico?")) {
      clearLastRaffleFromStorage();
      setStorageState({ ...storageState, lastRaffle: null });
      toast.success("Histórico limpo");
    }
  };

  const handleStartCountdown = () => {
    if (participants.length === 0) {
      toast.error("Adicione participantes antes de iniciar");
      return;
    }
    setState("countdown");
  };

  const handleCountdownComplete = () => {
    setState("drawing");

    const newSeed = Math.random().toString(36).substring(2);
    setSeed(newSeed);

    // ✅ drawWinners recebe 2 argumentos
    const drawnWinners = drawWinners(
      participants,
      settings.winnersCount,
    );
    setWinners(drawnWinners);
    setCurrentWinnerIndex(0);

    setAuditLog({
      timestamp: new Date().toISOString(),
      seed: newSeed,
      participants: [...participants],
      winners: drawnWinners,
      settings,
    });
  };

  const handleRevealNext = () => {
    if (currentWinnerIndex < winners.length - 1) {
      setCurrentWinnerIndex(currentWinnerIndex + 1);
    } else {
      saveLastRaffleToStorage(winners, {
        winnersCount: settings.winnersCount,
        totalParticipants: participants.length,
      });

      if (!settings.allowRepeatWinners) {
        const newParticipants = participants.filter(
          (p) => !winners.includes(p),
        );
        setParticipants(newParticipants);
        saveParticipantsToStorage(newParticipants);
      }

      setState("finished");
    }
  };

  const handleBackToParticipants = () => {
    setWinners([]);
    setCurrentWinnerIndex(0);
    setAuditLog(null);
    setState("participants");
  };

  const handleBackToSettings = () => {
    setState("settings");
  };

  const handleRestartRaffle = () => {
    setWinners([]);
    setCurrentWinnerIndex(0);
    setAuditLog(null);
    setState("settings");
  };

  const handleRerollWinner = (index: number) => {
    const newWinners = [...winners];
    const available = participants.filter(
      (p) => !newWinners.includes(p) || settings.allowRepeatWinners,
    );

    if (available.length === 0) {
      toast.error("Nenhum nome disponível para re-sortear");
      return;
    }

    const rerolled =
      available[Math.floor(Math.random() * available.length)];
    newWinners[index] = rerolled;
    setWinners(newWinners);
    toast.success("Prêmio re-sorteado!");
  };

  const handleCopyResults = async () => {
    const text = [
      "GANHADORES — SORTEIO HARDY",
      "",
      ...winners.map((w, i) => `${i + 1}. ${w}`),
      "",
      `Realizado em: ${new Date().toLocaleString("pt-BR")}`,
      seed ? `Seed do sorteio: ${seed}` : "",
    ].join("\n");

    await navigator.clipboard.writeText(text);
    toast.success("Resultados copiados!");
  };

  const handleSaveWinnerImage = async () => {
    const el = document.getElementById("winner-card");
    if (!el) return;
    const canvas = await html2canvas(el);
    const link = document.createElement("a");
    link.download = "vencedor.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    if (state === "drawing" && winners.length === 0) {
      setState("participants");
    }
  }, [state, winners.length]);

  const handleNewRaffleSameList = () => {
    setWinners([]);
    setCurrentWinnerIndex(0);
    setAuditLog(null);
    setState("settings");
  };

  return (
  <div
    className="
      min-h-screen 
      text-foreground 
      flex items-center justify-center 
      p-4 
      noise-bg 
      relative overflow-hidden
      bg-[url('/fundo.png')] bg-cover bg-center bg-no-repeat
    "
  >
    <div className="fixed top-20 left-20 w-96 h-96 bg-neon-green/10 rounded-full blur-[120px] pointer-events-none" />
    <div className="fixed bottom-20 right-20 w-96 h-96 bg-neon-teal/10 rounded-full blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {state === "participants" && (
          <ParticipantsManager
            key="participants"
            participants={participants}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={handleRemoveParticipant}
            onClearAll={handleClearAll}
            onLoadExample={handleLoadExample}
            onNext={() => setState("settings")}
            lastRaffle={storageState.lastRaffle}
            onUseSameList={handleUseSameList}
            onClearHistory={handleClearHistory}
          />
        )}

        {state === "settings" && (
          <RaffleSettings
            key="settings"
            settings={settings}
            onUpdateSettings={setSettings}
            onBack={handleBackToParticipants}
            onStart={handleStartCountdown}
            participantsCount={participants.length}
          />
        )}

        {state === "countdown" && (
          <CountdownScreen
            key="countdown"
            onComplete={handleCountdownComplete}
            duration={settings.countdownDuration}
            silentMode={settings.silentMode}
            dramaticMode={settings.dramaticMode}
            shuffleSpeed={settings.shuffleSpeed}
          />
        )}

        {state === "drawing" && (
          <DrawScreen
            key="drawing"
            allParticipants={participants}
            winners={winners}
            currentWinnerIndex={currentWinnerIndex}
            onRevealNext={handleRevealNext}
            isComplete={currentWinnerIndex === winners.length - 1}
            onBack={handleBackToParticipants}
            onBackToSettings={handleBackToSettings}
            onRestart={handleRestartRaffle}
            onCopyResults={handleCopyResults}
            onSaveWinnerImage={handleSaveWinnerImage}
            onRerollWinner={handleRerollWinner}
            auditLog={auditLog}
          />
        )}

        {state === "finished" && (
          <FinishedScreen
            key="finished"
            winners={winners}
            onNewRaffleSameList={handleNewRaffleSameList}
            onBackToParticipants={handleBackToParticipants}
            onCopyResults={handleCopyResults}
            onSaveWinnerImage={handleSaveWinnerImage}
            onRerollWinner={handleRerollWinner}
            auditLog={auditLog}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
