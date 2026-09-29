import JSZip from 'jszip';

function cellText(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function xmlEscape(value) {
  return cellText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function colLetter(index) {
  let n = index + 1;
  let out = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

export function mapImportedRows(rawRows, columns) {
  const keyByHeader = new Map();
  for (const column of columns) {
    keyByHeader.set(normalizeHeader(column.label), column.key);
    keyByHeader.set(normalizeHeader(column.key), column.key);
  }
  return rawRows.map((row) => {
    const next = {};
    for (const [header, value] of Object.entries(row)) {
      const key = keyByHeader.get(normalizeHeader(header));
      if (key) next[key] = value;
    }
    return next;
  });
}

export async function downloadExcel(filename, columns, rows) {
  const sheetRows = [columns.map((c) => c.label), ...rows.map((row) => columns.map((c) => cellText(row[c.key])))];
  const sheetBody = sheetRows
    .map(
      (line, r) =>
        `<row r="${r + 1}">${line
          .map(
            (value, c) =>
              `<c r="${colLetter(c)}${r + 1}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`,
          )
          .join('')}</row>`,
    )
    .join('');
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetBody}</sheetData></worksheet>`;

  const zip = new JSZip();
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
  );
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
  );
  zip.file(
    'xl/workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Data" sheetId="1" r:id="rId1"/></sheets></workbook>`,
  );
  zip.file(
    'xl/_rels/workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
  );
  zip.file('xl/worksheets/sheet1.xml', sheetXml);
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const name = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  triggerDownload(blob, name);
}

export async function downloadPdf(filename, title, columns, rows) {
  const html2canvas = (await import('html2canvas')).default;
  const {jsPDF} = await import('jspdf');
  const escapeHtml = (value) =>
    cellText(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  const host = document.createElement('div');
  host.setAttribute('dir', document.documentElement.dir || 'ltr');
  host.style.cssText =
    'position:fixed;left:-8000px;top:0;z-index:-1;background:#fff;color:#111;padding:28px;width:1100px;font-family:Tahoma,"Noto Naskh Arabic",Arial,sans-serif';
  const head = columns.map((c) => `<th style="border:1px solid #d0d5dd;padding:8px;background:#f8fafc;text-align:start">${escapeHtml(c.label)}</th>`).join('');
  const body = rows
    .map(
      (row) =>
        `<tr>${columns.map((c) => `<td style="border:1px solid #e5e7eb;padding:8px">${escapeHtml(row[c.key])}</td>`).join('')}</tr>`,
    )
    .join('');
  host.innerHTML = `<h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(title)}</h1><table style="border-collapse:collapse;width:100%;font-size:12px"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  document.body.appendChild(host);
  try {
    const canvas = await html2canvas(host, {scale: 2, backgroundColor: '#ffffff'});
    const img = canvas.toDataURL('image/png');
    const landscape = columns.length > 5;
    const doc = new jsPDF({orientation: landscape ? 'landscape' : 'portrait', unit: 'pt', format: 'a4'});
    const pageW = doc.internal.pageSize.getWidth() - 48;
    const pageH = doc.internal.pageSize.getHeight() - 48;
    const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
    doc.addImage(img, 'PNG', 24, 24, canvas.width * ratio, canvas.height * ratio);
    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } finally {
    host.remove();
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const src = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      if (row.some((v) => String(v).trim())) rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') cell += ch;
  }
  row.push(cell);
  if (row.some((v) => String(v).trim())) rows.push(row);
  if (!rows.length) return [];
  const headers = rows[0].map((h) => String(h).trim());
  return rows.slice(1).map((line) => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header || `col${i + 1}`] = line[i] ?? '';
    });
    return obj;
  });
}

function parseXmlCells(sheetXml, shared) {
  const rowMatches = [...sheetXml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)];
  const matrix = [];
  for (const rowMatch of rowMatches) {
    const cells = [...rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)];
    const line = [];
    for (const cell of cells) {
      const attrs = cell[1];
      const inner = cell[2];
      const ref = /r="([A-Z]+)/.exec(attrs);
      const col = ref ? ref[1].split('').reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0) - 1 : line.length;
      let value = '';
      const inline = /<t[^>]*>([\s\S]*?)<\/t>/.exec(inner);
      if (/\bt="s"/.test(attrs)) {
        const idx = Number(/<v>(\d+)<\/v>/.exec(inner)?.[1] ?? -1);
        value = shared[idx] || '';
      } else if (inline) {
        value = inline[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"');
      } else {
        value = /<v>([\s\S]*?)<\/v>/.exec(inner)?.[1] || '';
      }
      line[col] = value;
    }
    matrix.push(line);
  }
  if (!matrix.length) return [];
  const headers = (matrix[0] || []).map((h, i) => String(h || `col${i + 1}`).trim());
  return matrix.slice(1).map((line) => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = line[i] ?? '';
    });
    return obj;
  });
}

export async function parseTableFile(file) {
  const name = String(file?.name || '').toLowerCase();
  const buffer = await file.arrayBuffer();
  if (name.endsWith('.csv') || name.endsWith('.txt')) {
    return parseCsv(new TextDecoder().decode(buffer));
  }
  const zip = await JSZip.loadAsync(buffer);
  const sharedXml = await zip.file('xl/sharedStrings.xml')?.async('string');
  const shared = sharedXml
    ? [...sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => {
        const texts = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]);
        return texts.join('');
      })
    : [];
  const sheetFile = zip.file(/xl\/worksheets\/sheet\d+\.xml/)[0];
  if (!sheetFile) throw new Error('The spreadsheet has no worksheet.');
  const sheetXml = await sheetFile.async('string');
  return parseXmlCells(sheetXml, shared);
}
