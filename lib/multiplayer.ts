export interface Player {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  progress: number; // 0 to 1
  isHost: boolean;
  isMe: boolean;
  isBot?: boolean;
}

export type MultiplayerStatus = "idle" | "searching" | "waiting" | "starting" | "racing" | "finished";

export interface MultiplayerRoom {
  id: string;
  players: Player[];
  status: MultiplayerStatus;
  startTime?: number;
  countdown?: number;
  wordSeed?: string;
}

export const MOCK_BOT_NAMES = [
  "TurboTyper", "KeyNinja", "FastFinger", "WPM_Master", 
  "GhostWriter", "SpeedDemon", "AlphaKey", "KeyboardCat"
];
