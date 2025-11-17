export type RaffleState =
  | "participants"
  | "settings"
  | "countdown"
  | "drawing"
  | "finished";

export interface LastRaffleConfig {
  timestamp: number;
  winnersCount: number;
  totalParticipants: number;
  winners: string[];
}

export interface StorageState {
  participants: string[];
  lastRaffle: LastRaffleConfig | null;
}

export interface RaffleSettings {
  winnersCount: number;
  allowRepeatWinners: boolean;
  shuffleSpeed: "slow" | "normal" | "fast" | "hyper";
  countdownDuration: number;
  dramaticMode: boolean;
  silentMode: boolean;
}
