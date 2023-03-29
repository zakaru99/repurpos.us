import { AdisData } from './adis-data';
import { GVKData, IntegrityData, InformaData} from './index';


export interface VendorData extends Array<GVKData[] | IntegrityData[] | AdisData[] | InformaData[]> {
  0: GVKData[];
  1: IntegrityData[];
  2: AdisData[];
  3: InformaData[];
 }
