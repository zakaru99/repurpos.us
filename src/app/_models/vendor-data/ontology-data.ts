import { MappedTerm } from './mapped-term';

export interface OntologyData {
  drug_name: string;
  node_id: Array<string>;
  entity_name: Array<string>;
  preferred_name: Array<string>;
  ikey: string;
  parent_moa: Array<string>;
  parent_moa_path: Array<string>;
  xref: Array<string>;
  entity_id: Array<string>
}