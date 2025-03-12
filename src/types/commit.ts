export interface Commit {
  id: string;
  message: string;
  date: Date;
  userId: string;
  projectId?: string; // ID du projet associé au commit
  type?: string; // Type de commit (feat, fix, etc.)
  scope?: string; // Scope du commit (ui, core, etc.)
  changes: {
    added: string[];
    modified: string[];
    deleted: string[];
  };
}
