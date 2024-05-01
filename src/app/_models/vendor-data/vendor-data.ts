//UNCOMMENT TO ENABLE ADIS --> import { AdisData } from './adis-data';
import { GVKData, IntegrityData, InformaData, OntologyData} from './index';


  export interface VendorData extends Array<GVKData[] | IntegrityData[] | InformaData[] | OntologyData[]> {
  0: GVKData[];
  1: IntegrityData[];
  //UNCOMMENT TO ENABLE ADIS --> 2: AdisData[];
  2: InformaData[];
  3: OntologyData[]
 }
