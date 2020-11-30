export type RoomPlayer = {
  id: string;
  name: string;
  isAdmin: boolean;
};

export type RoomProps = {
  gameDeck: number;
  pyramidDouble: boolean;
  pyramidTriple: boolean;
  busfahrerDeck: number;
  maxPlayers: number;
  players: RoomPlayer[];
  isAdmin: boolean;
};

export type RoomSettings = {
  gameDeck: number;
  pyramidDouble: boolean;
  pyramidTriple: boolean;
  busfahrerDeck: number;
};
