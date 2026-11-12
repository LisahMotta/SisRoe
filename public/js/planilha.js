// planilha.js — gera um arquivo Excel (.xlsx) no navegador, sem bibliotecas externas.
//
// Um .xlsx é um ZIP com alguns arquivos XML. Aqui os arquivos vão "guardados" no ZIP (sem
// compressão), o que o Excel, o LibreOffice e o Google Planilhas aceitam normalmente.
// Uso: gerarXlsx([{ nome: 'Alunos', linhas: [{ coluna: valor, ... }, ...] }, ...]) → Blob

const enc = new TextEncoder();
const MAX_CELULA = 32000; // o Excel aceita até 32.767 caracteres por célula

const xml = (s) => String(s)
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function letraColuna(n) { // 0 → A, 25 → Z, 26 → AA
  let s = '';
  for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

function celula(ref, v, estilo = 0) {
  if (v === null || v === undefined || v === '') return '';
  const s = estilo ? ` s="${estilo}"` : '';
  if (typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}"${s}><v>${v}</v></c>`;
  const t = typeof v === 'object' ? JSON.stringify(v) : String(v);
  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${xml(t.slice(0, MAX_CELULA))}</t></is></c>`;
}

function planilhaXml(linhas) {
  const colunas = [];
  for (const l of linhas) for (const k of Object.keys(l)) if (!colunas.includes(k)) colunas.push(k);
  const cab = `<row r="1">${colunas.map((c, i) => celula(`${letraColuna(i)}1`, c, 1)).join('')}</row>`;
  const corpo = linhas.map((l, j) => `<row r="${j + 2}">${colunas.map((c, i) => celula(`${letraColuna(i)}${j + 2}`, l[c])).join('')}</row>`).join('');
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    + (colunas.length ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' : '')
    + `<sheetData>${colunas.length ? cab + corpo : ''}</sheetData></worksheet>`;
}

// Nome de aba: até 31 caracteres, sem : \ / ? * [ ] e sem repetir.
function nomesDeAba(nomes) {
  const usados = new Set();
  return nomes.map((n) => {
    let base = String(n).replace(/[:\\/?*[\]]/g, ' ').slice(0, 31).trim() || 'Planilha';
    let nome = base, i = 2;
    while (usados.has(nome.toLowerCase())) nome = `${base.slice(0, 28)} ${i++}`;
    usados.add(nome.toLowerCase());
    return nome;
  });
}

export function gerarXlsx(planilhas) {
  const abas = nomesDeAba(planilhas.map((p) => p.nome));
  const arquivos = [
    ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
      + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'
      + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
      + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
      + abas.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')
      + '</Types>'],
    ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ['xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
      + abas.map((n, i) => `<sheet name="${xml(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + '</sheets></workbook>'],
    ['xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + abas.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')
      + `<Relationship Id="rId${abas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
    // Estilo 1 = cabeçalho em negrito.
    ['xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
      + '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
      + '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
      + '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
      + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
      + '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>'
      + '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
      + '</styleSheet>'],
    ...planilhas.map((p, i) => [`xl/worksheets/sheet${i + 1}.xml`, planilhaXml(p.linhas)]),
  ];
  return new Blob([zipSemCompressao(arquivos.map(([nome, txt]) => [nome, enc.encode(txt)]))], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// ─── ZIP (método "stored") ───────────────────────────────────────────────────
const TABELA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = TABELA_CRC[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function zipSemCompressao(arquivos) {
  const partes = [];
  const central = [];
  let pos = 0;
  for (const [nome, dados] of arquivos) {
    const n = enc.encode(nome);
    const crc = crc32(dados);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true); local.setUint16(6, 0x0800, true); // UTF-8
    local.setUint16(8, 0, true); local.setUint32(14, crc, true);
    local.setUint32(18, dados.length, true); local.setUint32(22, dados.length, true); local.setUint16(26, n.length, true);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
    c.setUint32(16, crc, true); c.setUint32(20, dados.length, true); c.setUint32(24, dados.length, true);
    c.setUint16(28, n.length, true); c.setUint32(42, pos, true);
    partes.push(new Uint8Array(local.buffer), n, dados);
    central.push(new Uint8Array(c.buffer), n);
    pos += 30 + n.length + dados.length;
  }
  const tamCentral = central.reduce((s, p) => s + p.length, 0);
  const fim = new DataView(new ArrayBuffer(22));
  fim.setUint32(0, 0x06054b50, true); fim.setUint16(8, arquivos.length, true); fim.setUint16(10, arquivos.length, true);
  fim.setUint32(12, tamCentral, true); fim.setUint32(16, pos, true);
  return new Blob([...partes, ...central, new Uint8Array(fim.buffer)]);
}
