// CSV export of the compounds directly under an ontology node. Shared by the
// column browser's download button and the tree view's right-click.
// (The xref column carries the parent's xrefs, as the original export did.)

const q = (v: string) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;

export function exportCompoundsCsv(node: any, parent: any) {
  const parentXref = q(((parent && parent.xref) || []).join(';'));
  const rows = (node.children || []).filter(c => c.inchikey).map(item => [
    q(item.preferred_name),
    q((item.moa || []).join(';')),
    parentXref,
    q(item.smiles),
    q(item.inchikey),
    '=HYPERLINK("https://reframedb.org/compound_data/' + item.inchikey.substring(0, 14) + '")'
  ]);
  const csv = [['preferred name', 'moa', 'xref', 'smiles', 'inchikey', 'reframe link'], ...rows]
    .map(r => r.join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = (node.preferred_name || 'compounds') + '.csv';
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function holdsCompounds(node: any): boolean {
  return !!(node && node.children && node.children.length && 'inchikey' in node.children[0]);
}
