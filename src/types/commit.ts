export interface Commit {
  id: string;
  message: string;
  date: Date;
  userId: string;
  changes: {
    added: string[];
    modified: string[];
    deleted: string[];
  };
}
