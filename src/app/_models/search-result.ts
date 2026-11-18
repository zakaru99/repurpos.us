export class SearchResult {
  data: Compound[];
  // tabulatedData: Object;
  status?: number;
  url?: string;
  message?: string;      // the backend's reason when a search fails
  total?: number;        // matches found, when more than were returned
  truncated?: boolean;   // true when the backend returned only the top matches

  constructor(obj?: any) {
    if (obj.data) {
      const body = obj.data['body'];
      this.data = body['results'];
      this.status = obj.data.status || null;
      this.url = obj.data.url || null;
      this.total = body['total'] || null;
      this.truncated = !!body['truncated'];
    } else {
      this.data = null;
      this.status = obj.status || null;
      this.url = obj.url || null;
      this.message = (obj.error && obj.error.message) || null;
    }
  }

}

export interface Compound {
  id: string;
  main_label: string;
  assay_types: string[];
  aliases: string[];
  assays: number;
  smiles: string;
  properties: AvailableData[];
  similar_compounds?: SimilarCompound[];
  tanimoto: number;
  reframeid?: any;
  cbr_id?: any;
  highest_phase?: any;
  qid?: string;
  integrity_pediatrics?: boolean;
  disclosure_date?: string;
}

export interface AvailableData {
  name: string;
  value: boolean;
  tooltip?: string;
}

export interface SimilarCompound {
  compound_id: string;
  main_label: string;
  score: number;
  qid?: string;
}
