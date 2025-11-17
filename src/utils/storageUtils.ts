import { StorageState, LastRaffleConfig } from "@/types/raffle";

const STORAGE_KEY = "green-raffle-system";

export function loadStateFromStorage(): StorageState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { participants: [], lastRaffle: null };
    }
    const parsed = JSON.parse(data) as StorageState;
    return {
      participants: Array.isArray(parsed.participants) ? parsed.participants : [],
      lastRaffle: parsed.lastRaffle || null,
    };
  } catch (error) {
    console.error("Failed to load state from storage:", error);
    return { participants: [], lastRaffle: null };
  }
}

export function saveParticipantsToStorage(participants: string[]): void {
  try {
    const current = loadStateFromStorage();
    const updated: StorageState = {
      ...current,
      participants,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save participants:", error);
  }
}

export function saveLastRaffleToStorage(
  winners: string[],
  config: Omit<LastRaffleConfig, "timestamp" | "winners">
): void {
  try {
    const current = loadStateFromStorage();
    const lastRaffle: LastRaffleConfig = {
      ...config,
      winners,
      timestamp: Date.now(),
    };
    const updated: StorageState = {
      ...current,
      lastRaffle,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save last raffle:", error);
  }
}

export function clearParticipantsFromStorage(): void {
  try {
    const current = loadStateFromStorage();
    const updated: StorageState = {
      ...current,
      participants: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to clear participants:", error);
  }
}

export function clearLastRaffleFromStorage(): void {
  try {
    const current = loadStateFromStorage();
    const updated: StorageState = {
      ...current,
      lastRaffle: null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to clear last raffle:", error);
  }
}

export function clearAllStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear all storage:", error);
  }
}

export function resetRaffleState(): void {
  clearAllStorage();
}
