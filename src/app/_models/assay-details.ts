export interface AssayDetails {
	assay_id: string,
	assay_title: string,
	assay_type: string,
	authors: string,
	bibliography: string,
	components?: string,
	detection_method?: string,
	detection_reagents: string,
	// description?: string,
	drug_conc?: string,
	indication: string,
	summary: string,
	protocol?: string,
	purpose: string,
	readout: string,
	protocol_detection?: string,
	// detection_dye?: string
	title_short: string,
	primary_screened?: string,
	published: boolean
};
