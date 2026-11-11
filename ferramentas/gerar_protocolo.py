import json, re, sys
secoes = json.load(open('secoes2.json'))
TIT = {1:'Acidentes e eventos inesperados',2:'Agressão física',3:'Alerta de desaparecimento',4:'Ameaça de ataque ativo',
5:'Apologia ao nazismo',6:'Assédio moral',7:'Assédio sexual',8:'Ataque ativo concretizado',9:'Atos obscenos / atos libidinosos',
10:'Bullying e cyberbullying',11:'Comercialização de álcool e tabaco',12:'Comunicação violenta / conflito verbal',
13:'Consumo de álcool e tabaco',14:'Consumo de cigarro eletrônico',15:'Consumo de substâncias ilícitas',16:'Crimes cibernéticos',
17:'Dano ao patrimônio',18:'Envolvimento com tráfico de drogas ilícitas e psicoativas',19:'Evasão escolar',
20:'Fake news – disseminação de informações falsas',21:'Feminicídio',22:'Furto',23:'Gordofobia',24:'Homicídio / homicídio tentado',
25:'Homofobia',26:'Importunação sexual / estupro',27:'Incitamento e associação a atos infracionais / crimes',28:'Indisciplina',
29:'Invasão',30:'Mal súbito',31:'Óbito',32:'Ocupação de unidade escolar',33:'Posse de arma branca',34:'Posse de arma de brinquedo',
35:'Posse de arma de fogo / simulacro',36:'Racismo',37:'Roubo',38:'Sequestro',
39:'Sinais de alterações emocionais (irritabilidade, agressividade, ansiedade, pânico etc.)',40:'Sinais de automutilação',
41:'Sinais de isolamento social',42:'Situação de ameaça',43:'Suicídio concretizado',44:'Tentativa de suicídio',45:'Transfobia',
46:'Uso inadequado de dispositivos eletrônicos',47:'Violência de gênero contra meninas e mulheres',48:'Violência doméstica / maus-tratos',
49:'Vulnerabilidade familiar / cuidados parentais',50:'Xenofobia'}
MACRO = {}
for m, ns in {'a':[1],'b':[2,5,10,12,16,21,23,24,25,27,36,38,42,45,47,50],'c':[7,9,26],'d':[11,13,14,15,18],
              'e':[17,22,29,32,37],'f':[39,40,41,43,44],'g':[33,34,35],'h':[28,46],'i':[4,8],'j':[3,6,19,20,30,31,48,49]}.items():
    for n in ns: MACRO[n] = m
assert len(MACRO) == 50
URG = {1,4,8,21,24,29,30,31,33,35,37,38,43,44}
ADM = {28,46}
MEDIA = {12,19,34,39,41,49}
BO_ESCOLA = {3,4,8,17,18,21,24,29,31,33,35,37,38}
BO_NAO = {19,28,39,40,41,44,46,49}
BO_INTERESSADO = {12}
def limpa(t):
    t = re.split(r'\s+Artigo \d+º', t)[0]
    return t.strip()
saida = []
for s in secoes:
    n = s['n']
    cat = 'urgencia' if n in URG else 'administrativa' if n in ADM else 'grave'
    grav = 'urgencia' if cat == 'urgencia' else 'leve' if cat == 'administrativa' else 'media' if n in MEDIA else 'grave'
    bo = 'escola' if n in BO_ESCOLA else 'nao' if n in BO_NAO else 'interessado' if n in BO_INTERESSADO else 'avaliar'
    passos = []
    for p in s['passos']:
        q = {'k': p['k'], 't': limpa(p['t'])}
        if p.get('d'): q['d'] = [limpa(x) for x in p['d'] if limpa(x)]
        passos.append(q)
    saida.append({'codigo': f'4.{n}', 'descricao': TIT[n], 'macro': MACRO[n], 'categoria': cat, 'gravidade': grav,
                  'bo': bo, 'definicao': s['definicao'], 'passos': passos})
js = ('// protocolo179.js — GERADO a partir do DOC Conviva · Protocolo 179 — 3ª versão (SEDUC-SP),\n'
      '// capítulo 4 "Proteger para educar", seções 4.1 a 4.50. Os passos (a, b, c…) e subitens são o texto\n'
      '// do documento. Campos do SisRoe: macro (categorias a–j do cap. 4), categoria (urgencia | grave |\n'
      '// administrativa: agrupamento do SisRoe para agilizar o registro), gravidade inicial e bo\n'
      '// (regra de Boletim de Ocorrência da seção 1.4.4: escola | interessado | nao | avaliar).\n'
      '// Para uma nova versão do Protocolo, gere este arquivo de novo e use Administração → Tipos →\n'
      '// "Atualizar catálogo do Protocolo 179".\n\n'
      'export const VERSAO_PROTOCOLO = \'Protocolo 179 — 3ª versão\';\n\n'
      'export const SITUACOES_PROTOCOLO = ' + json.dumps(saida, ensure_ascii=False, indent=1) + ';\n')
open(sys.argv[1], 'w').write(js)
from collections import Counter
print(Counter(x['categoria'] for x in saida), Counter(x['bo'] for x in saida), len(js)//1024, 'KB')
