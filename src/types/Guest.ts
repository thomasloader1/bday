export interface Guest {
  id: string;
  name: string;
  group: string[];
  lunch?: { _lat: number; _long: number };
  after?: { _lat: number; _long: number };
  isConfirmed: boolean;
  isVoted?: boolean;
  isDrity: boolean;
  votedFor?: string;
}

export interface UpdateGuest {
  [key: string]: any;
}
