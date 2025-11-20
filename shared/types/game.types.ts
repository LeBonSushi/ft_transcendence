// Shared Game Types
export interface GameSession {
  id: string;
  players: string[];
  status: GameStatus;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
}

export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

export interface Player {
  id: string;
  userId: string;
  score: number;
  isReady: boolean;
}

export interface GameState {
  sessionId: string;
  currentTurn: string;
  players: Player[];
  metadata: Record<string, any>;
}
