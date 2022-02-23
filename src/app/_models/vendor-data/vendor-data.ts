import { GVKData, IntegrityData} from './index';


export interface VendorData extends Array<GVKData[] | IntegrityData[]> {
  0: GVKData[];
  1: IntegrityData[];
 }
