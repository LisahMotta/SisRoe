import re, json, sys
linhas = open(sys.argv[1], encoding='utf-8').read().replace('\f', '\n').split('\n')
limpas = [l for l in linhas if 'DOC – Conviva' not in l and 'Protocolo 179 – 3ª versão' not in l
          and not re.fullmatch(r'\s*\d{1,3}\s*', l)]
secoes, atual = [], None
for l in limpas:
    m = re.match(r'^\s*4\.(\d+)\.\s+(.+)$', l)
    if m and int(m.group(1)) <= 50 and (atual is None or int(m.group(1)) == atual['n'] + 1):
        atual = {'n': int(m.group(1)), 'linhas': []}; secoes.append(atual); continue
    if atual: atual['linhas'].append(l)

BUL = '•▪●'
def limpa(t): return re.sub(r'\s+', ' ', t).strip()
saida = []
for s in secoes:
    L = s['linhas']
    ini = next((i for i, l in enumerate(L) if re.match(r'^\s{0,6}a\)\s', l)), len(L))
    # definição: linhas com pouca indentação antes do passo "a)"
    defin = ' '.join(l.strip() for l in L[:ini] if l.strip() and len(l) - len(l.lstrip()) <= 2)
    passos, cur, esperado = [], None, 'a'
    for l in L[ini:]:
        m = re.match(r'^\s{0,6}([a-z])\)\s+(.*)$', l)
        if m and m.group(1) == esperado:
            cur = {'k': m.group(1), 't': m.group(2).strip(), 'd': []}
            passos.append(cur); esperado = chr(ord(esperado) + 1); modo = 't'; continue
        if cur is None: continue
        t = l.strip()
        if not t: modo = 'fim' if modo == 't' else modo; continue
        if t.startswith('💡') or t.startswith('Atenção'): modo = 'fim'; continue
        if t[0] in BUL:
            cur['d'].append(t.lstrip(BUL).strip()); modo = 'd'; continue
        ind = len(l) - len(l.lstrip())
        if modo == 't' and ind >= 2: cur['t'] += ' ' + t
        elif modo == 'd' and ind >= 8: cur['d'][-1] += ' ' + t
        elif ind < 2: modo = 'fim'
    for p in passos:
        p['t'] = limpa(p['t']); p['d'] = [limpa(x) for x in p['d'] if limpa(x)]
        if not p['d']: del p['d']
    saida.append({'n': s['n'], 'definicao': limpa(defin)[:600], 'passos': passos})
json.dump(saida, open('secoes2.json', 'w'), ensure_ascii=False, indent=1)
for x in saida:
    nd = sum(len(p.get('d', [])) for p in x['passos'])
    print(x['n'], 'passos', len(x['passos']), 'subitens', nd, '| def:', x['definicao'][:90])
