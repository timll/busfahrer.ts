export type RoomPlayer = {
  id: string;
  name: string;
  isAdmin: boolean;
};

export type RoomSettings = {
  gameDeck: number;
  pyramidDouble: boolean;
  pyramidTriple: boolean;
  busfahrerDeck: number;
};

export type RoomUpdate = {
  gameDeck: number;
  pyramidDouble: boolean;
  pyramidTriple: boolean;
  busfahrerDeck: number;
};
