export type RoomStatus = {
  status: string;
  users: {
    creator: string;
    joiner: string;
  };
};

export type ReadyUpdate = {
  username: string;
  bothReady: boolean;
  newState: string;
};

export type Message = {
  username: string;
  text: string;
  timestamp: string;
};
