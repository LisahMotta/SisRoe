# Gerar o catálogo do Protocolo 179

`server/protocolo179.js` é gerado a partir do PDF oficial do DOC Conviva · Protocolo 179.
Para uma nova versão do documento:

```bash
pdftotext -layout protocolo.pdf todo.txt
```

1. Deixe em `cap4.txt` só o capítulo 4 (de "4. PROTEGER PARA EDUCAR" até antes do capítulo 5).
2. Extraia as seções (gera `secoes2.json`):

```bash
python3 -I ferramentas/extrair_protocolo.py cap4.txt
```

3. Confira títulos, macrocategorias, agrupamento e regras de B.O. no início de `gerar_protocolo.py`
   (os números das seções podem mudar entre versões) e gere o módulo:

```bash
python3 -I ferramentas/gerar_protocolo.py server/protocolo179.js
```

4. Rode `npm test`. Depois, em cada escola: Administração → Tipos → "Atualizar catálogo do Protocolo 179".
   As ocorrências já registradas guardam os passos que valiam no momento do registro.
