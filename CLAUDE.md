# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commands

```bash
npm install
npm start      # http://localhost:3000 (SQLite in data/sisroe.db)
npm run dev    # auto-restart on change
npm test       # node:test API suite, in-memory SQLite
```

Syntax-check a file with `node --check <file>`. Requires Node >= 22.13 (uses built-in `node:sqlite`).

## Architecture

Multi-school (multi-tenant) incident log. Express backend + vanilla JS SPA (ES modules, no build step).

- `server/db.js`: one adapter for SQLite (`node:sqlite`) and PostgreSQL (when `DATABASE_URL` is set). Write SQL with `?`
  placeholders; they become `$n` for PG. Use `db.insert` to get the new id, and `db.transacao` for multi-step writes.
  Timestamps are ISO strings created in JS (`db.agora()`), not DB defaults.
- **Tenant rule:** every query on school data MUST filter by `escola_id = req.usuario.escola_id`, including lookups
  of ids that come from the client (tipo_id, turma_id, aluno ids). `test/api.test.js` has isolation tests: extend
  them when adding routes.
- `server/auth.js`: JWT holds `{uid, eid}`. The user is reloaded on every request (deactivation takes effect right away).
  `trocar_senha` blocks everything except `/eu` and `/minha-senha`. Roles: `exigeGestao` (poc/coordenador/vice/diretor)
  and `exigeAdmin` (vice/diretor).
- `public/js/catalogo.js`: shared by server and browser. Default types (seeded per school at signup), protocol steps
  (`PROCEDIMENTOS`, keys stored in `ocorrencias.protocolo`; don't rename keys already in use), roles and labels.
- Frontend: `app.js` hash router loads `telas/<name>.js`, each exporting `render(el, params)`. The CSP forbids inline
  scripts and handlers: wire events with `addEventListener`. Always pass user content through `esc()`.
- Integrity rules: the original relato is never edited (use notas), gravidade only goes up, ocorrências are cancelled
  (with a reason), never deleted.
