// pdf.js — gera o PDF da ocorrência (documento para imprimir e arquivar).
// Usa a fonte Helvetica embutida no padrão PDF (sem arquivos de fonte), que cobre os
// acentos do português. Caracteres fora desse conjunto (ex.: emoji) viram "?".
import PDFDocument from 'pdfkit';
import { CATEGORIAS, GRAVIDADES, STATUS, NIVEIS, MACROS, PAPEIS_ALUNO, PERFIS, REGRAS_BO, HIPOTESES_AFASTAMENTO } from '../public/js/catalogo.js';

const COR = { texto: '#0f172a', suave: '#475569', claro: '#94a3b8', linha: '#cbd5e1', marca: '#0f2a4a' };
// Caracteres extras da codificação WinAnsi (além do Latin-1) que a Helvetica embutida tem.
const WINANSI = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ'.split(''));
const limpo = (v) => String(v ?? '').replace(/\r\n/g, '\n').split('')
  .map((c) => (c === '\n' || (c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 256) || WINANSI.has(c) ? c : '?')).join('');

const dataBR = (iso) => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '');
const dataHoraBR = (iso) => (iso ? new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }) : '');

export function gerarPdfOcorrencia(o, escola, emitidoPor) {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 60, left: 50, right: 50 }, bufferPages: true,
    info: { Title: `Ocorrência ${o.numero} — ${escola.nome}`, Author: 'SisRoe', Subject: 'Registro de Ocorrência Escolar' } });
  const partes = [];
  doc.on('data', (c) => partes.push(c));
  const fim = new Promise((ok) => doc.on('end', () => ok(Buffer.concat(partes))));

  const L = doc.page.margins.left;
  const W = doc.page.width - L - doc.page.margins.right;
  const espaco = (h) => { if (doc.y + h > doc.page.height - doc.page.margins.bottom) doc.addPage(); };

  // ─── Cabeçalho ───
  const topo = doc.y;
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COR.texto).text(limpo(escola.nome), L, topo, { width: W - 140 });
  const sub = [escola.cie && `CIE ${escola.cie}`, escola.municipio, escola.diretoria].filter(Boolean).join(' · ');
  if (sub) doc.font('Helvetica').fontSize(8.5).fillColor(COR.suave).text(limpo(sub), { width: W - 140 });
  const fimEsq = doc.y;
  doc.font('Helvetica').fontSize(7.5).fillColor(COR.suave).text('OCORRÊNCIA Nº', L + W - 130, topo, { width: 130, align: 'right' });
  doc.font('Courier-Bold').fontSize(14).fillColor(COR.marca).text(limpo(o.numero), L + W - 130, doc.y, { width: 130, align: 'right' });
  doc.y = Math.max(fimEsq, doc.y) + 6;
  doc.moveTo(L, doc.y).lineTo(L + W, doc.y).lineWidth(1.5).strokeColor(COR.marca).stroke();
  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COR.texto).text('Registro de Ocorrência Escolar', L, doc.y, { width: W, align: 'center' });
  const selos = [CATEGORIAS[o.categoria]?.nome, `Gravidade: ${GRAVIDADES[o.gravidade] || o.gravidade}`,
    `Situação: ${STATUS[o.status] || o.status}`, o.nivel && NIVEIS[o.nivel]?.nome].filter(Boolean).join('   ·   ');
  doc.font('Helvetica').fontSize(8.5).fillColor(COR.suave).text(limpo(selos), { width: W, align: 'center' });
  doc.moveDown(0.8);

  // ─── Blocos ───
  const secao = (titulo) => {
    espaco(40);
    doc.moveDown(0.6);
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COR.marca).text(limpo(titulo.toUpperCase()), L, doc.y, { width: W, characterSpacing: 0.5 });
    doc.moveTo(L, doc.y + 2).lineTo(L + W, doc.y + 2).lineWidth(0.5).strokeColor(COR.linha).stroke();
    doc.moveDown(0.5);
  };
  const paragrafo = (t) => {
    doc.font('Helvetica').fontSize(10).fillColor(COR.texto).text(limpo(t), L, doc.y, { width: W, lineGap: 2 });
  };
  // Campos em duas colunas (rótulo pequeno + valor).
  const campos = (pares) => {
    const col = (W - 20) / 2;
    for (let i = 0; i < pares.length; i += 2) {
      const linha = pares.slice(i, i + 2);
      const alturas = linha.map(([, v]) => doc.font('Helvetica').fontSize(10).heightOfString(limpo(v || '—'), { width: col }) + 14);
      espaco(Math.max(...alturas));
      const y = doc.y;
      linha.forEach(([rot, v], j) => {
        if (!rot) return; // coluna vazia de propósito
        const x = L + j * (col + 20);
        doc.font('Helvetica').fontSize(7).fillColor(COR.suave).text(limpo(rot.toUpperCase()), x, y, { width: col, characterSpacing: 0.3 });
        doc.font('Helvetica').fontSize(10).fillColor(COR.texto).text(limpo(v || '—'), x, y + 10, { width: col });
      });
      doc.y = y + Math.max(...alturas);
    }
  };

  campos([
    ['Tipo', `${o.tipo_codigo} · ${o.tipo_descricao}`],
    ['Macrocategoria (Protocolo 179)', o.macro ? `${o.macro}) ${MACROS[o.macro]}` : '—'],
    ['Data e horário do fato', `${dataBR(o.data)} às ${o.hora}`],
    ['Escola tomou conhecimento em', o.data_conhecimento ? dataBR(o.data_conhecimento) : dataBR(o.data)],
    ['Local', o.local],
    ['Turma', o.turma_nome || '—'],
    ['Registrado por', `${o.registrado_por_nome} (${PERFIS[o.registrado_por_perfil] || o.registrado_por_perfil})`],
    ['Registrado em', dataHoraBR(o.criado_em)],
  ]);

  secao('Estudantes envolvidos');
  if (!o.alunos.length) paragrafo('Nenhum estudante identificado.');
  else {
    const cols = [{ t: 'Nome', w: W * 0.46 }, { t: 'RA', w: W * 0.16 }, { t: 'Turma', w: W * 0.18 }, { t: 'Papel', w: W * 0.2 }];
    const linhaTabela = (valores, cabecalho) => {
      const altura = Math.max(...valores.map((v, i) => doc.font(cabecalho ? 'Helvetica-Bold' : 'Helvetica').fontSize(cabecalho ? 7.5 : 9.5)
        .heightOfString(limpo(v), { width: cols[i].w - 6 }))) + 8;
      espaco(altura);
      const y = doc.y;
      if (cabecalho) doc.rect(L, y, W, altura).fill('#f1f5f9');
      let x = L;
      valores.forEach((v, i) => {
        doc.font(cabecalho ? 'Helvetica-Bold' : 'Helvetica').fontSize(cabecalho ? 7.5 : 9.5).fillColor(cabecalho ? COR.suave : COR.texto)
          .text(limpo(v), x + 3, y + 4, { width: cols[i].w - 6 });
        x += cols[i].w;
      });
      doc.moveTo(L, y + altura).lineTo(L + W, y + altura).lineWidth(0.4).strokeColor(COR.linha).stroke();
      doc.y = y + altura;
    };
    linhaTabela(cols.map((c) => c.t.toUpperCase()), true);
    o.alunos.forEach((a) => linhaTabela([a.nome, a.ra || '—', a.turma_nome || '—', PAPEIS_ALUNO[a.papel] || a.papel], false));
  }

  secao('Relato dos fatos');
  paragrafo(o.relato);
  if (o.analise_inicial) { secao('Síntese da análise inicial'); paragrafo(o.analise_inicial); }
  if (o.manifestacao_estudante) { secao('Manifestação do(a) estudante'); paragrafo(o.manifestacao_estudante); }
  if (o.providencias) { secao('Providências'); paragrafo(o.providencias); }

  const proprios = o.passos.some((p) => /^[a-z]$/.test(p.k));
  secao(proprios ? `Procedimentos — Protocolo 179 (3ª versão), ${o.tipo_codigo}` : 'Intervenções pedagógicas (Art. 7º, Res. SEDUC nº 68/2026)');
  const feitos = new Set(o.protocolo);
  for (const p of o.passos) {
    const t = `${feitos.has(p.k) ? '[X]' : '[  ]'}  ${/^[a-z]$/.test(p.k) ? `${p.k}) ` : ''}${p.t}`;
    espaco(doc.heightOfString(limpo(t), { width: W }) + 4);
    doc.font(feitos.has(p.k) ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor(feitos.has(p.k) ? COR.texto : COR.suave)
      .text(limpo(t), L, doc.y, { width: W, lineGap: 1 });
    doc.moveDown(0.25);
  }

  secao('Comunicações e registros');
  campos([
    ['Família comunicada', o.familia_comunicada
      ? `Sim${o.familia_data ? ` em ${dataBR(o.familia_data)}` : ''}${o.familia_meio ? ` (${o.familia_meio})` : ''}${o.familia_obs ? ` — ${o.familia_obs}` : ''}` : 'Não'],
    ['Conselho Tutelar acionado', o.conselho_tutelar ? 'Sim' : 'Não'],
    ['Registro na Plataforma CONVIVA', o.conviva_registrado ? 'Sim' : 'Não'],
    ['Boletim de Ocorrência', `${o.bo_numero || '—'}${o.bo_orientado ? ' · família orientada sobre o registro' : ''}`],
    ...(o.rede_devolutiva ? [['Devolutiva da rede protetiva', o.rede_devolutiva], ['', '']] : []),
  ]);
  if (o.bo_regra && REGRAS_BO[o.bo_regra]) {
    doc.font('Helvetica-Oblique').fontSize(8).fillColor(COR.suave).text(limpo(`Regra de B.O. (Protocolo 179, 1.4.4): ${REGRAS_BO[o.bo_regra]}`), L, doc.y, { width: W });
  }
  if (o.status === 'encerrada') {
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(9).fillColor(COR.texto).text(limpo(`Encerrada por ${o.encerrado_por_nome || ''} em ${dataHoraBR(o.encerrado_em)}.`), L, doc.y, { width: W });
  }
  if (o.status === 'cancelada') {
    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#b91c1c').text(limpo(`REGISTRO CANCELADO. Motivo: ${o.motivo_cancelamento || ''}`), L, doc.y, { width: W });
  }

  if (o.afastamentos.length) {
    secao('Afastamento preventivo temporário (Cap. IV, Res. SEDUC nº 68/2026)');
    for (const a of o.afastamentos) {
      paragrafo(`${a.aluno_nome}: a partir de ${dataBR(a.data_inicio)}, ${a.dias_letivos} dia(s) letivo(s)`
        + `${a.prorrogado ? ` + prorrogação de ${a.prorrogacao_dias} dia(s) (Conselho de Escola em ${dataBR(a.prorrogacao_conselho_data)})` : ''}`
        + ` — ${a.status === 'vigente' ? 'vigente' : 'encerrado'}.`);
      doc.font('Helvetica').fontSize(8.5).fillColor(COR.suave)
        .text(limpo(`Hipóteses: ${a.hipoteses.map((h) => HIPOTESES_AFASTAMENTO[h] || h).join('; ')}`), L, doc.y, { width: W });
      doc.moveDown(0.4);
    }
  }

  if (o.notas.length) {
    secao('Acompanhamento');
    for (const n of o.notas) {
      espaco(30);
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COR.suave).text(limpo(`${n.usuario_nome} · ${dataHoraBR(n.criado_em)}`), L, doc.y, { width: W });
      paragrafo(n.texto);
      doc.moveDown(0.4);
    }
  }

  // ─── Assinaturas ───
  espaco(90);
  doc.moveDown(3);
  const y = doc.y;
  const larg = (W - 40) / 3;
  [[o.registrado_por_nome, 'Responsável pelo registro'], ['', 'Ciência do(a) responsável pelo estudante'], ['', 'Direção / Equipe gestora']]
    .forEach(([nome, papel], i) => {
      const x = L + i * (larg + 20);
      doc.moveTo(x, y).lineTo(x + larg, y).lineWidth(0.7).strokeColor(COR.texto).stroke();
      doc.font('Helvetica').fontSize(8.5).fillColor(COR.texto).text(limpo(nome), x, y + 4, { width: larg, align: 'center' });
      doc.font('Helvetica').fontSize(7.5).fillColor(COR.suave).text(limpo(papel), x, y + 16, { width: larg, align: 'center' });
    });

  // ─── Rodapé com número de página ───
  const paginas = doc.bufferedPageRange();
  for (let i = 0; i < paginas.count; i++) {
    doc.switchToPage(i);
    doc.page.margins.bottom = 0; // o rodapé fica abaixo da margem; sem isso o pdfkit criaria página extra
    const yr = doc.page.height - 40;
    doc.font('Helvetica').fontSize(7).fillColor(COR.claro)
      .text(limpo(`SisRoe · Documento reservado (ECA, LGPD e Art. 9º, § 2º, Res. SEDUC nº 68/2026) · Emitido por ${emitidoPor} em ${dataHoraBR(new Date().toISOString())}`),
        L, yr, { width: W - 70, lineBreak: false });
      doc.text(`Página ${i + 1} de ${paginas.count}`, L + W - 70, yr, { width: 70, align: 'right', lineBreak: false });
  }
  doc.end();
  return fim;
}
