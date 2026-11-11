// passos.js — desenha a lista de procedimentos (checkbox) de uma ocorrência.
// Os passos do Protocolo 179 têm texto principal (t) e, às vezes, subitens (d).
import { esc } from './ui.js';
import { REGRAS_BO, MACROS } from './catalogo.js';

/** Lista de checkboxes. feitos: Set com as chaves já marcadas. */
export function htmlPassos(passos, feitos = new Set(), nome = 'prot') {
  return passos.map((p) => `
    <div class="passo">
      <label class="check"><input type="checkbox" name="${nome}" value="${esc(p.k)}" ${feitos.has(p.k) ? 'checked' : ''}>
        <span>${/^[a-z]$/.test(p.k) ? `<b>${esc(p.k)})</b> ` : ''}${esc(p.t)}</span></label>
      ${p.d?.length ? `<details class="passo-det"><summary>Como fazer (${p.d.length})</summary>
        <ul>${p.d.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
    </div>`).join('');
}

/** Versão para o documento impresso (☑/☐, sem subitens). */
export function htmlPassosDoc(passos, feitos) {
  return `<ul class="doc-checklist">${passos.map((p) => `<li class="${feitos.has(p.k) ? 'ok' : ''}">${feitos.has(p.k) ? '☑' : '☐'}
    ${/^[a-z]$/.test(p.k) ? `${esc(p.k)}) ` : ''}${esc(p.t)}</li>`).join('')}</ul>`;
}

/** Caixa com a regra de Boletim de Ocorrência (seção 1.4.4 do Protocolo 179). */
export function htmlRegraBO(regra) {
  if (!regra || !REGRAS_BO[regra]) return '';
  return `<div class="regra-bo bo-${esc(regra)}"><b>Boletim de Ocorrência:</b> ${esc(REGRAS_BO[regra])}</div>`;
}

export const nomeMacro = (m) => (m && MACROS[m] ? `${m}) ${MACROS[m]}` : '');
