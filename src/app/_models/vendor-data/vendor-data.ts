import { AdisData } from './adis-data';
import { GVKData, IntegrityData} from './index';


export interface VendorData extends Array<GVKData[] | IntegrityData[] | AdisData[]> {
  0: GVKData[];
  1: IntegrityData[];
  2: AdisData[];
 }
