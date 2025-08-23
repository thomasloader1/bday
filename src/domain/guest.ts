export type Guest = {
  id: number;
  name: string;
  group: string[];
  lunch?: { _lat: number; _long: number };
  after?: { _lat: number; _long: number };
  isConfirmed: boolean;
  isVoted?: boolean;
  isDrity: boolean;
  votedFor?: string;
}
