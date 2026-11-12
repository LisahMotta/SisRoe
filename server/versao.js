// versao.js — identifica a versão publicada do SisRoe.
// Na Vercel e no Render vem do commit publicado; no computador, do momento em que o
// servidor ligou (cada reinício conta como versão nova, o que também ajuda nos testes).
export const VERSAO =
  process.env.VERCEL_GIT_COMMIT_SHA
  || process.env.RENDER_GIT_COMMIT
  || process.env.SISROE_VERSAO
  || `local-${Date.now()}`;
