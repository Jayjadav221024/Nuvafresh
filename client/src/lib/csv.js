/* ═══════════════════════════════════════════════════════════════════
   CSV
   Spreadsheet round-tripping for the admin's Import / Export buttons.
   Both directions follow RFC 4180 — quoted fields, doubled quotes, and
   newlines inside a cell — because a product description exported from
   this store has to survive a trip through Excel and come back intact.
═══════════════════════════════════════════════════════════════════ */

/** Quote a single cell only when it actually needs it. */
const escapeCell = (value) => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/**
 * Build a CSV document.
 * @param {object[]} rows
 * @param {{header: string, write: (row: object) => any}[]} columns
 * @returns {string}
 */
export const toCsv = (rows, columns) => {
  const head = columns.map((c) => escapeCell(c.header)).join(',');
  const body = rows.map((row) => columns.map((c) => escapeCell(c.write(row))).join(','));
  return [head, ...body].join('\r\n');
};

/**
 * Parse a CSV document into objects keyed by its header row.
 * @param {string} text
 * @returns {{headers: string[], rows: object[]}}
 */
export const parseCsv = (text) => {
  // A byte order mark from Excel would otherwise become part of the first header.
  const input = String(text || '').replace(/^﻿/, '');
  const table = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (quoted) {
      if (char === '"') {
        // A doubled quote inside a quoted field is a literal quote.
        if (input[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      // Swallow the LF of a CRLF pair so it doesn't open an empty row.
      if (char === '\r' && input[i + 1] === '\n') i += 1;
      row.push(cell);
      table.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell !== '' || row.length > 0) {
    row.push(cell);
    table.push(row);
  }

  const nonEmpty = table.filter((r) => r.some((c) => String(c).trim() !== ''));
  if (nonEmpty.length === 0) return { headers: [], rows: [] };

  const headers = nonEmpty[0].map((h) => h.trim());
  const rows = nonEmpty.slice(1).map((cells) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = (cells[index] ?? '').trim();
    });
    return record;
  });

  return { headers, rows };
};

/** Hand the browser a CSV file to save. */
export const downloadCsv = (filename, content) => {
  // The BOM is what makes Excel open UTF-8 rupee signs and accents correctly.
  const blob = new Blob([`﻿${content}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoking immediately can cancel the download in Safari; a tick is enough.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Read a File the user picked into a string. */
export const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('That file could not be read.'));
    reader.readAsText(file);
  });
