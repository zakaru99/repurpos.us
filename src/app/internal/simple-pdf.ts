// Minimal PDF writer for text documents (no dependency). Lays out a list of
// blocks on US Letter pages in Helvetica, wraps long text, adds page numbers,
// and returns a Blob ready to download.
//
// Text is written with WinAnsi encoding, so Latin characters, µ, curly quotes
// and dashes come through; anything outside that set prints as "?".

export type PdfBlock =
  | { type: 'title'; text: string }
  | { type: 'meta'; text: string }
  | { type: 'field'; label: string; value: string }
  | { type: 'heading'; text: string }
  | { type: 'para'; text: string; muted?: boolean };

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 56;
const TEXT_W = PAGE_W - MARGIN * 2;
const LABEL_W = 120;   // field label column
const FOOTER_Y = 32;

// Helvetica advance widths (1/1000 em) for ASCII 32-126
const HELVETICA = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584
];

// Unicode characters that WinAnsi places in 0x80-0x9F
const WIN_ANSI: { [ch: string]: number } = {
  '€': 0x80, '‚': 0x82, '„': 0x84, '…': 0x85, '‘': 0x91, '’': 0x92, '“': 0x93,
  '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '™': 0x99
};

interface Font { name: string; size: number; bold: boolean; grey: number; }

const FONTS: { [k: string]: Font } = {
  title: { name: 'F2', size: 16, bold: true, grey: 0.07 },
  meta: { name: 'F1', size: 9.5, bold: false, grey: 0.42 },
  label: { name: 'F1', size: 10, bold: false, grey: 0.42 },
  value: { name: 'F1', size: 10.5, bold: false, grey: 0.07 },
  heading: { name: 'F2', size: 12, bold: true, grey: 0.07 },
  para: { name: 'F1', size: 10.5, bold: false, grey: 0.07 },
  muted: { name: 'F1', size: 10.5, bold: false, grey: 0.42 },
  footer: { name: 'F1', size: 8.5, bold: false, grey: 0.5 }
};

function toWinAnsi(text: string): string {
  let out = '';
  for (const ch of (text || '').replace(/\r\n?/g, '\n')) {
    const code = ch.charCodeAt(0);
    if (ch === '\t') { out += '    '; }
    else if (code === 10 || (code >= 32 && code <= 126) || (code >= 160 && code <= 255)) { out += ch; }
    else if (WIN_ANSI[ch]) { out += String.fromCharCode(WIN_ANSI[ch]); }
    else { out += '?'; }
  }
  return out;
}

function textWidth(text: string, font: Font): number {
  let units = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    units += c >= 32 && c <= 126 ? HELVETICA[c - 32] : 556;
  }
  // Helvetica-Bold runs a little wider; err on the side of wrapping early
  return units * font.size / 1000 * (font.bold ? 1.1 : 1);
}

// Greedy word wrap; words longer than the line are broken mid-word
function wrap(text: string, font: Font, width: number): string[] {
  const lines: string[] = [];
  text.split('\n').forEach(paragraph => {
    let line = '';
    paragraph.split(/ +/).forEach(word => {
      const candidate = line ? line + ' ' + word : word;
      if (textWidth(candidate, font) <= width) { line = candidate; return; }
      if (line) { lines.push(line); }
      line = '';
      while (textWidth(word, font) > width) {
        let cut = word.length;
        while (cut > 1 && textWidth(word.slice(0, cut), font) > width) { cut--; }
        lines.push(word.slice(0, cut));
        word = word.slice(cut);
      }
      line = word;
    });
    lines.push(line);
  });
  return lines;
}

function escape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function buildPdf(blocks: PdfBlock[], footerText: string): Blob {
  const pages: string[][] = [[]];
  let y = PAGE_H - MARGIN;

  const ensure = (needed: number) => {
    if (y - needed < MARGIN + 12) {
      pages.push([]);
      y = PAGE_H - MARGIN;
    }
  };
  const put = (text: string, x: number, font: Font) => {
    pages[pages.length - 1].push(
      `BT /${font.name} ${font.size} Tf ${font.grey} g ${x.toFixed(2)} ${y.toFixed(2)} Td (${escape(text)}) Tj ET`);
  };
  const lineHeight = (font: Font) => font.size * 1.45;

  blocks.forEach(block => {
    switch (block.type) {
      case 'title': {
        const font = FONTS.title;
        wrap(toWinAnsi(block.text), font, TEXT_W).forEach(line => {
          ensure(lineHeight(font)); y -= font.size; put(line, MARGIN, font); y -= font.size * 0.4;
        });
        y -= 2;
        break;
      }
      case 'meta': {
        const font = FONTS.meta;
        wrap(toWinAnsi(block.text), font, TEXT_W).forEach(line => {
          ensure(lineHeight(font)); y -= lineHeight(font); put(line, MARGIN, font);
        });
        y -= 14;
        break;
      }
      case 'field': {
        const label = FONTS.label, value = FONTS.value;
        const lines = wrap(toWinAnsi(block.value || '—'), value, TEXT_W - LABEL_W);
        lines.forEach((line, i) => {
          ensure(lineHeight(value)); y -= lineHeight(value);
          if (i === 0) { put(toWinAnsi(block.label), MARGIN, label); }
          put(line, MARGIN + LABEL_W, value);
        });
        y -= 3;
        break;
      }
      case 'heading': {
        const font = FONTS.heading;
        ensure(lineHeight(font) + 40);   // keep a heading with its first lines
        y -= 16 + font.size;
        put(toWinAnsi(block.text), MARGIN, font);
        y -= 4;
        break;
      }
      case 'para': {
        const font = block.muted ? FONTS.muted : FONTS.para;
        wrap(toWinAnsi(block.text), font, TEXT_W).forEach(line => {
          ensure(lineHeight(font)); y -= lineHeight(font); put(line, MARGIN, font);
        });
        break;
      }
    }
  });

  // Footer on every page: "<footerText> · Page n of m"
  pages.forEach((ops, i) => {
    const text = toWinAnsi(footerText + ' · Page ' + (i + 1) + ' of ' + pages.length);
    ops.push(`BT /${FONTS.footer.name} ${FONTS.footer.size} Tf ${FONTS.footer.grey} g ${MARGIN} ${FOOTER_Y} Td (${escape(text)}) Tj ET`);
  });

  // Objects: 1 catalog, 2 page tree, 3-4 fonts, then a page and its content per page
  const objects: string[] = [];
  const pageIds = pages.map((_, i) => 5 + i * 2);
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map(id => id + ' 0 R').join(' ')}] /Count ${pages.length} >>`;
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
  pages.forEach((ops, i) => {
    const pageId = pageIds[i], contentId = pageId + 1;
    const stream = ops.join('\n');
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  // Every character is a single byte, so string offsets are byte offsets
  let pdf = '%PDF-1.4\n%âãÏÓ\n';
  const offsets: number[] = [];
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id++) {
    pdf += ('0000000000' + offsets[id]).slice(-10) + ' 00000 n \n';
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) { bytes[i] = pdf.charCodeAt(i) & 0xff; }
  return new Blob([bytes], { type: 'application/pdf' });
}
