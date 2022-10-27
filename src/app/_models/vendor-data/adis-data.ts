import { MappedTerm } from './mapped-term';

export interface AdisData {
  adis_id: number;
  drug_name: string[]; // changed as of 2020-02-03
  phase: Array<string>;
  therapeutic_areas: Array<string>;
  category: MappedTerm[]; // changed as of 2020-02-03
  mechanism: MappedTerm[]; // changed as of 2020-02-03
  smiles: string;
  synonyms: Array<string>;
  ikey: string;
}