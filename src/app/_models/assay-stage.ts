// Where a screen stands, shared by the Assays list and the assay page.
// The backend sends a workflow status; these group it into four stages.

export type Stage = 'Pre-screen' | 'Screening' | 'Completed' | 'Closed' | 'Other';

export const STAGE_ORDER: Stage[] = ['Pre-screen', 'Screening', 'Completed', 'Closed', 'Other'];

// Which stage each workflow status belongs to. Anything not listed is "Other".
const STAGES: { [status: string]: Stage } = {
  'reframe waiting for mta': 'Pre-screen',
  'reframe mta signed': 'Pre-screen',
  'reframe lopac': 'Pre-screen',
  'hts queue': 'Pre-screen',
  'reframe primary screen sent': 'Screening',
  'reframe dose response sent': 'Screening',
  'reframe dose response data received': 'Screening',
  'hts active assay ready plates': 'Screening',
  'reframe screen completed': 'Completed',
  'reframe completed but need milestones': 'Completed',
  'reframe awaiting milestones': 'Completed',
  'hts success': 'Completed',
  'crest screen completed': 'Completed',
  'reframe screen terminated and closed': 'Closed',
  'reframe project closed': 'Closed'
};

export function stageOf(status: string): Stage {
  return STAGES[(status || '').trim().toLowerCase()] || 'Other';
}

// The status as shown to people: without the "ReFRAME" prefix
export function statusLabel(status: string): string {
  return (status || '').trim().replace(/^reframe\s+/i, '');
}

// CSS class for a stage: prescreen, screening, completed, closed, other
export function stageClass(stage: Stage): string {
  return stage.toLowerCase().replace(/[^a-z]/g, '');
}

// For a secondary assay, the primary assay it follows up, when its summary
// or purpose names one ("Secondary assay for A00440."). The text is the only
// source: some assays say this without being flagged secondary, and most
// flagged ones describe the primary in words, so this returns null for them.
export function primaryAssayFor(a: { assay_id?: string; summary?: string; purpose?: string; primary_screened?: string }): string {
  const text = [a.summary, a.purpose].filter(Boolean).join(' ');
  const said = text.match(/\b(?:secondary|counter[- ]?screen)[^.]{0,80}?\b(A\d{5})\b/i);
  if (said && said[1] !== a.assay_id) { return said[1]; }
  // Flagged secondary: any other assay ID in the text is the primary
  if (a.primary_screened === 'secondary') {
    const other = (text.match(/\bA\d{5}\b/g) || []).find(id => id !== a.assay_id);
    return other || null;
  }
  return null;
}
