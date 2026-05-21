import type { SavedGame } from "@/types";

const STORAGE_KEY = "chess-agent-saved-games";
const MAX_SAVED = 20;

export function loadSavedGames(): SavedGame[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedGame[]) : [];
  } catch {
    return [];
  }
}

export function persistGame(game: SavedGame): void {
  if (typeof window === "undefined") return;
  const games = loadSavedGames();
  const idx = games.findIndex((g) => g.id === game.id);
  if (idx >= 0) {
    games[idx] = game;
  } else {
    games.unshift(game);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games.slice(0, MAX_SAVED)));
}

export function removeGame(id: string): void {
  if (typeof window === "undefined") return;
  const games = loadSavedGames().filter((g) => g.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}
