export interface Proposal {
  id: number;
  submittedBy: string;
  email?: string;
  institution?: string;
  status?: string;
  submittedOn?: string;
  indication?: string;
  description?: string;
  notes?: string;
  denialReason?: string;
}
