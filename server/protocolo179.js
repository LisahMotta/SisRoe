// protocolo179.js — GERADO a partir do DOC Conviva · Protocolo 179 — 3ª versão (SEDUC-SP),
// capítulo 4 "Proteger para educar", seções 4.1 a 4.50. Os passos (a, b, c…) e subitens são o texto
// do documento. Campos do SisRoe: macro (categorias a–j do cap. 4), categoria (urgencia | grave |
// administrativa: agrupamento do SisRoe para agilizar o registro), gravidade inicial e bo
// (regra de Boletim de Ocorrência da seção 1.4.4: escola | interessado | nao | avaliar).
// Para uma nova versão do Protocolo, gere este arquivo de novo e use Administração → Tipos →
// "Atualizar catálogo do Protocolo 179".

export const VERSAO_PROTOCOLO = 'Protocolo 179 — 3ª versão';

export const SITUACOES_PROTOCOLO = [
 {
  "codigo": "4.1",
  "descricao": "Acidentes e eventos inesperados",
  "macro": "a",
  "categoria": "urgencia",
  "gravidade": "urgencia",
  "bo": "avaliar",
  "definicao": "",
  "passos": [
   {
    "k": "a",
    "t": "Se acidente com criança ou adolescente:",
    "d": [
     "Verificar a situação da vítima e a avaliar necessidade de acionar o SAMU e/ou Corpo de Bombeiros em casos de lesão grave;",
     "Informar à família e/ou responsável legal;",
     "Em caso de necessidade de socorro, um integrante da equipe escolar deverá acompanhar a vítima até o hospital;",
     "Isolar o espaço do acidente se identificado espaço de risco;",
     "Prestar o devido acolhimento à família e à vítima durante e após o episódio;",
     "Comunicar a Supervisão de rotina / Unidade Regional de Ensino;",
     "Planejar atividades de recomposição de aprendizagens em caso de afastamento por recomendação médica;",
     "Registrar o episódio na Plataforma Conviva."
    ]
   },
   {
    "k": "b",
    "t": "Se acidente com servidor / prestador de serviços:",
    "d": [
     "Verificar a situação da vítima e a avaliar necessidade de acionar o SAMU e/ou Corpo de Bombeiros em casos de lesão grave;",
     "Informar à família ou contato de emergência da vítima;",
     "Em caso de necessidade de socorro, um integrante da equipe escolar deverá acompanhar a vítima até o hospital;",
     "Se identificado espaço de risco, isolar o local do acidente;",
     "Prestar o devido acolhimento à vítima durante e após o episódio;",
     "Comunicar a Supervisão de rotina / Unidade Regional de Ensino;",
     "Consultar o departamento de pessoas (recursos humanos) da URE sobre procedimentos em caso de caracterização de acidente de trabalho;"
    ]
   },
   {
    "k": "c",
    "t": "Eventos inesperados – se falta de água e/ou energia elétrica:",
    "d": [
     "Acionar a concessionária responsável pelo serviço essencial;",
     "Avaliar junto à Unidade Regional de Ensino Regional a possibilidade/necessidade de dispensar os alunos (com base no tempo previsto para o retorno do serviço, necessidade de reparos na rede etc.);",
     "Em caso de necessidade de dispensar alunos: acionar os responsáveis para autorização da liberação",
     "Elaborar o plano de reposição para as aulas/atividades não realizadas e submeter à Supervisão/Unidade Regional de Ensino.",
     "Registrar o episódio na Plataforma Conviva;"
    ]
   },
   {
    "k": "d",
    "t": "Eventos inesperados – se alagamento, queda de árvore, incêndio.",
    "d": [
     "Seguir o previsto e proposto no “Plano de Contingência” da U.E.;",
     "Direcionar a equipe para espaços e ambientes seguros pré-determinados;",
     "Acionar as autoridades competentes de acordo com o contexto;",
     "Informar a Supervisão/Unidade Regional de Ensino;",
     "Avaliar junto à Unidade Regional de Ensino Regional a possibilidade e/ou necessidade de dispensar os estudantes (com base no cenário local);",
     "Em caso de necessidade de dispensar estudantes: acionar os responsáveis para autorização da liberação e elaborar o plano de reposição para as aulas/atividades não realizadas para submeter à Supervisão/Unidade Regional de Ensino;",
     "Registrar o episódio na Plataforma Conviva."
    ]
   },
   {
    "k": "e",
    "t": "Eventos inesperados – se pragas e/ou infestações.",
    "d": [
     "Seguir o previsto e proposto no “Plano de Contingência” da U.E;",
     "Direcionar a equipe para espaços e ambientes seguros pré-determinados;",
     "Acionar as autoridades competentes de acordo com o contexto (Bombeiros, centro de zoonoses, quando couber);",
     "Informar a Supervisão/Unidade Regional de Ensino;",
     "Avaliar junto à Unidade Regional de Ensino Regional a possibilidade e/ou necessidade de dispensar os estudantes (com base no cenário local);",
     "Em caso de necessidade de dispensar estudantes: acionar os responsáveis para autorização da liberação e elaborar o plano de reposição para as aulas/atividades não realizadas para submeter à Supervisão/Unidade Regional de Ensino;",
     "Providenciar a manutenção dos serviços de dedetização (ou similares), conforme contexto;",
     "Registrar o episódio na Plataforma Conviva."
    ]
   }
  ]
 },
 {
  "codigo": "4.2",
  "descricao": "Agressão física",
  "macro": "b",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "",
  "passos": [
   {
    "k": "a",
    "t": "Conter o conflito e separar os envolvidos em espaços diferenciados para impedir que a situação perdure.",
    "d": [
     "Acionar o Botão do Pânico, na impossibilidade de contenção dos envolvidos;",
     "Solicitar apoio da ronda escolar ou ligar 190, se houver risco iminente de continuidade das agressões;",
     "Acionar o SAMU caso a agressão resulte em lesão corporal grave entre os envolvidos."
    ]
   },
   {
    "k": "b",
    "t": "Acolher os envolvidos e providenciar a mediação da situação de conflito, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso. Não relativize a situação.",
    "d": [
     "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento, quando julgar necessário;",
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima).",
     "Em ambos os casos, articular o acesso aos serviços da RAPS (Rede de Atenção Psicossocial), quando considerado que a vítima está em sofrimento emocional."
    ]
   },
   {
    "k": "c",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável);",
     "Se constatada omissão familiar no acompanhamento do estudante, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família."
    ]
   },
   {
    "k": "d",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir chamado na plataforma."
    ]
   },
   {
    "k": "e",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "f",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática da Violência e/ou Agressão.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Em caso de necessidade, planejar ações complementares, principalmente se houver recorrência do tema entre os registros realizados na Plataforma Conviva."
    ]
   },
   {
    "k": "g",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes."
   },
   {
    "k": "h",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da agressão."
   },
   {
    "k": "i",
    "t": "Orientar (formalmente / documentar) a família e/ou responsáveis pelos envolvidos sobre o registro de Boletim de Ocorrência, acompanhando até a delegacia, quando necessário."
   },
   {
    "k": "j",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando parceria e diálogo para continuidade das tratativas de acolhimento, quando se fizer necessário, em ações integradas que promovam o acesso, atendimento e acompanhamento dos indivíduos, conforme o contexto.",
    "d": [
     "Sim, agressão física é crime e deve ser tratada como tal.",
     "Se leve (sem gravidade), cabe à vítima/família representar (ação penal condicionada).",
     "Se grave (ou contra servidor público em função), é ação penal pública incondicionada → a própria escola deve registrar B.O.",
     "Quando a agressão não deixa marcas nem causa lesão (ex.: empurrão, puxão de cabelo), pode ser considerada contravenção penal (vias de fato, art. 21 da Lei das Contravenções Penais).",
     "Quando há ferimento, dor ou danos à saúde → já é crime de lesão corporal."
    ]
   }
  ]
 },
 {
  "codigo": "4.3",
  "descricao": "Alerta de desaparecimento",
  "macro": "j",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "escola",
  "definicao": "",
  "passos": [
   {
    "k": "a",
    "t": "Verificar se a família da vítima já acionou a Polícia Militar via 190.",
    "d": [
     "Em caso de criança ou adolescente, verificar se o Conselho Tutelar foi comunicado pela família e/ou responsável legal, se não, formalizar a informação;",
     "Em caso de crianças, não se faz necessário aguardar 24h para a denúncia se confirmar."
    ]
   },
   {
    "k": "b",
    "t": "Orientar a família sobre o Registro de Boletim de Ocorrência e, acompanhá-los até a delegacia, se necessário.",
    "d": [
     "Se a criança desapareceu dentro da escola, cabe ao Diretor (ou representante equivalente) registrar o Boletim de Ocorrência."
    ]
   },
   {
    "k": "c",
    "t": "Comunicar o ocorrido em grupo de PSVE (ou equivalente) para promoção de busca integrada."
   },
   {
    "k": "d",
    "t": "Colaborar com a polícia, o Conselho Tutelar e outros órgãos competentes para agilizar a busca e localização do estudante."
   },
   {
    "k": "e",
    "t": "Informar a Supervisão / Unidade Regional de Ensino."
   },
   {
    "k": "f",
    "t": "Se ato cometido dentro – os nas imediações – da unidade escolar, verificar junto à equipe regional (URE) em consonância com a equipe central (SEDUC/SP) quanto aos desdobramentos e orientações complementares.",
    "d": [
     "Verificar se as recomendações de segurança desse presente documento foram seguidas corretamente, no que tange a segurança no ambiente escolar;",
     "Solicitar a preservação das imagens."
    ]
   },
   {
    "k": "g",
    "t": "Registrar o episódio na Plataforma Conviva."
   }
  ]
 },
 {
  "codigo": "4.4",
  "descricao": "Ameaça de ataque ativo",
  "macro": "i",
  "categoria": "urgencia",
  "gravidade": "urgencia",
  "bo": "escola",
  "definicao": "",
  "passos": [
   {
    "k": "a",
    "t": "Preservar as evidências de ameaça (primeira pessoa da comunidade escolar que tiver acesso deverá fazê-lo), salvando imagens, mensagens, prints em redes sociais, áudios etc.",
    "d": [
     "Nos casos de ameaça via telefone (fixo ou celular), identificar o número para fins de investigação, e quando possível gravar a ligação."
    ]
   },
   {
    "k": "b",
    "t": "Comunicar a Polícia Militar, por meio do telefone de emergência 190.",
    "d": [
     "Comparecer o representante da Unidade Escolar no Distrito Policial da localidade, a fim da autoridade competente lavrar o Boletim de Ocorrência.",
     "Notificar os provedores dos sites envolvidos.",
     "Denunciar na página ou site que a ameaça e/ou fakenews foi postada;"
    ]
   },
   {
    "k": "c",
    "t": "Se identificado o autor da mensagem e/ou manifestação, quando estudante, acionar a família para ciência e providências – comunicar simultaneamente as autoridades policiais.",
    "d": [
     "É importante a realização de uma escuta ativa, quando possível – e desde seja constatada essa possibilidade sem exposição à riscos – com intuito de identificar a origem das ideações.",
     "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento, quando necessário.",
     "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável).",
     "Articular junto ao Conselho Tutelar proposição de parcerias junto aos serviços da rede protetiva para acompanhamento do autor/família, baseando-se em ações educativas e restaurativas, em consonância com os órgãos de segurança, para monitoramento."
    ]
   },
   {
    "k": "d",
    "t": "Em caso de identificação de autor que não pertence à comunidade escolar, comunicar imediatamente as autoridades policiais."
   },
   {
    "k": "e",
    "t": "Informar a Unidade Regional de Ensino - Supervisor da Unidade Escolar / Dirigente Regional de Ensino.",
    "d": [
     "A Equipe Conviva Regional (URE) deverá informar o Assessor Técnico de Segurança responsável pela Unidade Regional de Ensino para apoio."
    ]
   },
   {
    "k": "f",
    "t": "Orientar a comunidade escolar para não retransmitirem as postagens das ameaças."
   },
   {
    "k": "g",
    "t": "Consultar os protocolos específicos de segurança, como Plano de Contingência e similares."
   },
   {
    "k": "h",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma, inclusive, das providencias envolvendo às autoridades policiais;",
     "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário;"
    ]
   },
   {
    "k": "i",
    "t": "Consultar o “Plano de Contingência” (ou protocolo de segurança indicado pela SEDUC) para verificar se há ações que contemplem o cenário de potencial invasão/ataque.",
    "d": [
     "Avaliar se as ações do referido plano vigente estão atingindo os objetivos esperados, com ciência de todos os envolvidos sobre suas responsabilidades.",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos.",
     "Promover espaços e momentos de escuta da comunidade escolar, para evitar o silenciamento de situações latentes."
    ]
   },
   {
    "k": "j",
    "t": "Solicitar apoio de grupos e programas como PSVE no que tange a vigilância e segurança coletivas, assim como, auxílio na contenção de fakenews.",
    "d": [
     "Se fakenews, articular ações complementares em parceria com o Grêmio Estudantil na proposição de projetos de combate à fakenews, engajando ações e/ou atividades pedagógicas de conscientização junto aos estudantes.",
     "Articular projetos pedagógicos com a equipe docente para a promoção de ações educativas sobre fakenews e violência, em consonância com a BNCC."
    ]
   },
   {
    "k": "k",
    "t": "É imprescindível a comunicação e a articulação com a rede protetiva e as forças de segurança para acompanhamento e monitoramento, devido a possibilidade de evolução para outras infrações mais graves."
   },
   {
    "k": "l",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da ação."
   }
  ]
 },
 {
  "codigo": "4.5",
  "descricao": "Apologia ao nazismo",
  "macro": "b",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "",
  "passos": [
   {
    "k": "a",
    "t": "Acolher a vítima, quando houver."
   },
   {
    "k": "b",
    "t": "Se identificado o autor da mensagem e/ou manifestação nazista, acionar a família para ciência e providências.",
    "d": [
     "É importante a realização de uma escuta ativa que permita, minimamente, a equipe escolar identificar de onde vieram essas interpretações e ideações nazistas;",
     "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento, quando necessário.",
     "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável).",
     "Articular junto ao Conselho Tutelar proposição de parcerias junto aos serviços da rede protetiva para acompanhamento do autor/família, baseando-se em ações educativas e restaurativas, quando possível."
    ]
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação.",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma."
    ]
   },
   {
    "k": "d",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática e/ou temas similares/equivalentes que abarquem a questão/sensibilidade (Racismo / Educação Antirracista, por exemplo).",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos;",
     "Promover espaços e momentos de escuta da comunidade escolar, para evitar o silenciamento."
    ]
   },
   {
    "k": "f",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes.",
    "d": [
     "Proposição de debates e formações sobre temáticas como direitos humanos e Holocausto;",
     "Círculos de diálogo e atividades restaurativas em parceria com a equipe docente;",
     "Promover ações de coletividade e fortalecimento das relações."
    ]
   },
   {
    "k": "g",
    "t": "Articular projetos pedagógicos com a equipe docente para a promoção de ações educativas sobre o Holocausto, perpassando por temáticas como direitos humanos, antirracismo e combate à intolerância, por exemplo, em consonância com a BNCC.",
    "d": [
     "Quando possível, articular parcerias com entidades de proteção aos Direitos Humanos, para promoção de estratégias e ações pedagógicas complementares."
    ]
   },
   {
    "k": "h",
    "t": "Quando houver vítima, orientar (formalmente / documentar) a família e/ou responsáveis pelos envolvidos sobre o registro de Boletim de Ocorrência, acompanhando até a delegacia, quando necessário.",
    "d": [
     "Em caso de manifestação simbólica com dando ao patrimônio, um representante da equipe gestora deverá realizar o registro do Boletim de Ocorrência.",
     "É imprescindível a comunicação com a rede protetiva e as forças de segurança para acompanhamento e monitoramento, caso a situação evolua para outras infrações."
    ]
   },
   {
    "k": "i",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da ação."
   },
   {
    "k": "j",
    "t": "Articular parcerias com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando diálogo para continuidade das tratativas de acolhimento – quando se fizer necessário – e em ações integradas que promovam a (in)formação, assim como, possibilitem o acesso e acompanhamento de pessoas em situação de sofrimento, caso necessário."
   }
  ]
 },
 {
  "codigo": "4.6",
  "descricao": "Assédio moral",
  "macro": "j",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "O assédio moral consiste em práticas de constrangimento, isolamento, perseguição, humilhação ou intimidação, de forma repetitiva e prolongada, que visam ou resultam em abalar a autoestima, a dignidade ou a integridade psíquica da vítima, buscando desestabilizá-la. Comumente acontece em relações hierárquicas no ambiente de trabalho, quando manifestado entre estudantes (pares), configura-se como bullying.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher os envolvidos e providenciar a mediação da situação de conflito, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso. Não relativize a situação.",
    "d": [
     "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento, quando julgar necessário;"
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelo estudante envolvido dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável);"
    ]
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir chamado na plataforma."
    ]
   },
   {
    "k": "d",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática do “Assédio” e/ou similares em suas diversas manifestações (como Bullying)",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Em caso de necessidade, planejar ações complementares, principalmente se houver recorrência do tema entre os registros realizados na Plataforma Conviva."
    ]
   },
   {
    "k": "f",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da agressão.",
    "d": [
     "Em caso de envolvimento apenas entre servidores públicos, não há registro em plataforma, mas deverão ser seguidos os demais procedimentos até o envio de relatório para a URE, quando compreender-se que não há condições de mediação possíveis pela equipe local."
    ]
   },
   {
    "k": "g",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando parceria e diálogo para continuidade das tratativas de acolhimento, quando se fizer necessário, em ações integradas que promovam o acesso, atendimento e acompanhamento dos indivíduos, conforme o contexto."
   }
  ]
 },
 {
  "codigo": "4.7",
  "descricao": "Assédio sexual",
  "macro": "c",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "Assédio sexual é qualquer comportamento de conotação sexual que seja não desejado, inconveniente ou ofensivo, e que cause constrangimento, intimidação ou humilhação à vítima. Ele pode ocorrer em diversos ambientes, inclusive no escolar, realizadas de forma física (toques inapropriados e sem consentimento), verbal (comentários, elogios inadequados, convites) ou não verbal (mensagens escritas). O elemento central é o consentimento inexistente e o uso de poder ou insistência para fins sexuais.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher a vítima, preferencialmente por profissional do mesmo gênero, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso. Não relativize a situação.",
    "d": [
     "Atentar-se ao acolhimento adequado que não promova revitimização (repetição do relato de maneira que se reviva o trauma da vítima);",
     "NUNCA realizar acareação entre a vítima e o potencial agressor;",
     "Agendar a atuação do Psicólogo da Educação para acolhimento da vítima;",
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima);",
     "Mantenha o sigilo sobre o episódio, preservando a vítima."
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família;",
     "Recomenda-se que o servidor que realizou o primeiro acolhimento / escuta da denúncia junto a vítima participe do diálogo para relatar o episódio, para que seja preservada a integridade emocional vítima (evite a revitimização);"
    ]
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações previstas/planejadas no âmbito de ações pedagógicas e restaurativas, no que tange o cuidado com a vítima;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir chamado na plataforma – principalmente no que tange a articulação junto à rede protetiva."
    ]
   },
   {
    "k": "d",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens, áudios ou similares."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática do “Assédio” e/ou similares em suas diversas manifestações.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Em caso de necessidade, planejar ações complementares, principalmente se houver recorrência do tema entre os registros realizados na Plataforma Conviva.",
     "Promover espaços e momentos de escuta da comunidade escolar, para evitar o silenciamento."
    ]
   },
   {
    "k": "f",
    "t": "Orientar (formalmente / documentar) a família e/ou responsáveis pelos envolvidos sobre o registro de Boletim de Ocorrência, acompanhando a família da vítima até a delegacia – principalmente para que não se promova a revitimização e/ou violência institucional. Em todas as situações: proteja a vítima!"
   },
   {
    "k": "g",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da agressão.",
    "d": [
     "Em caso de envolvimento apenas entre servidores públicos, não há registro em plataforma, mas deverão ser seguidos os demais procedimentos até o envio de relatório para a URE, quando compreender-se que não há condições de mediação possíveis pela equipe local.",
     "Todo caso de Assédio Sexual envolvendo servidor deverá ser encaminhado para Controladoria Geral do Estado de São Paulo (CGE/SP)."
    ]
   },
   {
    "k": "h",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes.",
    "d": [
     "Promover ações de coletividade, respeito e fortalecimento das relações.",
     "Campanhas de conscientização sobre respeito ao corpo, igualdade de gênero e consentimento;",
     "Ser espaço de acolhimento e escuta entre pares, ajudando estudantes a identificar situações de assédio;",
     "Apoiar a escola na divulgação de canais de denúncia e proteção."
    ]
   },
   {
    "k": "i",
    "t": "Articular projetos pedagógicos com a equipe docente para a promoção de ações educativas e letramento sobre as diferenças entre abuso, assédio e importunação sexual, em consonância com a BNCC."
   },
   {
    "k": "j",
    "t": "Quando possível, articular parcerias com DDM para ações complementares na U.E., na busca pela mitigação de novos casos."
   },
   {
    "k": "k",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva:",
    "d": [
     "Polícia Civil / Delegacia de Defesa da Mulher (DDM) – registro da ocorrência e investigação.",
     "Conselho Tutelar – quando envolver crianças e adolescentes, para medidas protetivas.",
     "CREAS – acompanhamento psicossocial da vítima e da família.",
     "Defensoria Pública – garantia de orientação e defesa jurídica gratuita.",
     "Supervisão / Unidade Regional de Ensino – notificação e acompanhamento da gestão escolar."
    ]
   }
  ]
 },
 {
  "codigo": "4.8",
  "descricao": "Ataque ativo concretizado",
  "macro": "i",
  "categoria": "urgencia",
  "gravidade": "urgencia",
  "bo": "escola",
  "definicao": "",
  "passos": [
   {
    "k": "a",
    "t": "Acionar os órgãos de segurança por meio do Botão do Pânico e 190."
   },
   {
    "k": "b",
    "t": "Acionar os órgãos de saúde para atendimento de vítimas e primeiros socorros."
   },
   {
    "k": "c",
    "t": "Executar as ações previstas em documento orientador específico – Protocolo de Ataque Ativo.",
    "d": [
     "Na ausência de documento / plano orientador específico – disponibilizado pelo órgão central – seguir o previsto no Plano de Contingência, para situações de invasão."
    ]
   }
  ]
 },
 {
  "codigo": "4.9",
  "descricao": "Atos obscenos / atos libidinosos",
  "macro": "c",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "Os atos obscenos são práticas de comportamentos de natureza sexual em local público ou exposto ao público, caracterizando ofensa ao pudor coletivo (ex.: exposição de órgãos genitais, masturbação ou toques em partes íntimas, gestos ou comportamentos sexualmente explícitos). Já o ato libidinoso configura a conduta de caráter sexual, com ou sem contato físico, destinadas à satisfação da lascívia (desejo sexual). Caso o ato envolva uma vítima – uma vez constatada a falta de consentimento – verificar as orientações pertinentes aos casos de importunação sexual, assédio ou estupro. O consentimento é ",
  "passos": [
   {
    "k": "a",
    "t": "Em se tratando de um ato obsceno, acolher os envolvidos, preferencialmente por profissional do mesmo gênero, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso. Não relativize a situação.",
    "d": [
     "Atentar-se ao acolhimento adequado, compreendendo não se tratar de um crime grave, mas de uma quebra das normas de convivência que exige ação pedagógica de conscientização;",
     "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento, quando julgar necessário;",
     "Mantenha o sigilo sobre o episódio, preservando a vítima."
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família;",
     "Trabalhar pedagogicamente as questões pertinentes a exploração da sexualidade, assim como, condutas de respeito e limites/normas;",
     "Recomenda-se que o servidor que realizou o primeiro acolhimento / escuta participe do diálogo para relatar o episódio, preservando sempre a integridade emocional das crianças e adolescentes."
    ]
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações previstas/planejadas no âmbito de ações pedagógicas e restaurativas, no que tange o cuidado com a vítima;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir chamado na plataforma – principalmente no que tange a articulação junto à rede protetiva."
    ]
   },
   {
    "k": "d",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, somente em casos de tipificação criminal, que não configurem o ato obsceno – neste seguir as orientações da categoria correlacionada."
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática em contexto e/ou temáticas similares em suas múltiplas manifestações possíveis.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Em caso de necessidade, planejar ações complementares, principalmente se houver recorrência do tema entre os registros realizados na Plataforma Conviva;"
    ]
   },
   {
    "k": "f",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da agressão. Cabe a escola registrar Boletim de Ocorrência, nessas situações.",
    "d": [
     "Ato libidinoso sem consentimento.",
     "Envolvimento de criança ou adolescente em situação de vulnerabilidade.",
     "Situações envolvendo adultos contra estudantes."
    ]
   },
   {
    "k": "g",
    "t": "Articular projetos pedagógicos com a equipe docente para a promoção de ações educativas sobre educação sexual."
   }
  ]
 },
 {
  "codigo": "4.10",
  "descricao": "Bullying e cyberbullying",
  "macro": "b",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "Bullying consiste na prática recorrente de violência física, verbal, psicológica ou social entre pares, caracterizada por intencionalidade, repetição e desequilíbrio de poder, causando sofrimento à vítima. Já o Cyberbullying é uma modalidade de bullying realizada em meios digitais (redes sociais, aplicativos, mensagens etc.), que amplia o alcance e a permanência da agressão, expondo a vítima a danos ainda maiores e pode caracterizar crimes cibernéticos.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher a vítima e providenciar a mediação da situação de conflito, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso. Não relativize a situação.",
    "d": [
     "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento, quando necessário.",
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima).",
     "Em ambos os casos, articular o acesso aos serviços da RAPS (Rede de"
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável).",
     "Se constatada omissão familiar ou violação de direitos da criança/adolescente por parte da família e/ou dos responsáveis, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família para a garantia de direitos."
    ]
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação.",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma."
    ]
   },
   {
    "k": "d",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática “Bullying e Cyberbullying”.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos;",
     "Promover espaços e momentos de escuta da comunidade escolar, para evitar o silenciamento."
    ]
   },
   {
    "k": "f",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes.",
    "d": [
     "Conscientizar a comunidade escolar sobre a Lei nº 13.185/2015 – Programa de Combate à Intimidação Sistemática (Bullying).",
     "Promover ações de coletividade e fortalecimento das relações."
    ]
   },
   {
    "k": "g",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da ação."
   },
   {
    "k": "h",
    "t": "Articular parcerias com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando diálogo para continuidade das tratativas de acolhimento – quando se fizer necessário – e em ações integradas que promovam a (in)formação, assim como, possibilitem o acesso e acompanhamento de pessoas em situação de sofrimento, caso necessário."
   }
  ]
 },
 {
  "codigo": "4.11",
  "descricao": "Comercialização de álcool e tabaco",
  "macro": "d",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "O comércio de drogas lícitas no ambiente escolar consiste na venda, distribuição ou oferta de substâncias como álcool e cigarro dentro da escola ou em suas imediações, especialmente quando envolve crianças e adolescentes. Apesar de serem legalmente permitidas em outros contextos, essas substâncias são proibidas por lei em espaços educativos, pois representam riscos à saúde, à segurança e ao desenvolvimento dos estudantes. Essa prática configura violação do Estatuto da Criança e do Adolescente (ECA) e pode ser enquadrada como crime, exigindo ação imediata da gestão escolar, com registro, comuni",
  "passos": [
   {
    "k": "a",
    "t": "Realizar o acolhimento e providenciar a mediação da situação."
   },
   {
    "k": "b",
    "t": "Conscientizar os envolvidos sobre as questões prejudiciais à saúde (deles e dos demais) diante do consumo dessas substâncias."
   },
   {
    "k": "c",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável);",
     "Se constatada omissão familiar ou violação de direitos da criança/adolescente por parte da família e/ou dos responsáveis, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família para a garantia de direitos;"
    ]
   },
   {
    "k": "d",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma."
    ]
   },
   {
    "k": "e",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios.",
     "comércio de álcool/cigarro dentro ou próximo da escola;",
     "fornecimento realizado por adultos às crianças e aos adolescentes;",
     "situações de risco grave à saúde ou violência associada ao consumo."
    ]
   },
   {
    "k": "f",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática em questão ou outras similares.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos;"
    ]
   },
   {
    "k": "g",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes."
   },
   {
    "k": "h",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da ação."
   },
   {
    "k": "i",
    "t": "Articular parcerias com os serviços da rede de saúde territorial, buscando diálogo e parceria em ações integradas que promovam a (in)formação, assim como, possibilitem o acesso e acompanhamento de pessoas em situação de sofrimento, caso necessário."
   },
   {
    "k": "j",
    "t": "Promover ação de conscientização coletiva na unidade escolar.",
    "d": [
     "Afixar nos espaços internos e externos da unidade escolar, placas informativas com as leis sobre a proibição de consumo de fumígenos em espaços públicos / escolares."
    ]
   }
  ]
 },
 {
  "codigo": "4.12",
  "descricao": "Comunicação violenta / conflito verbal",
  "macro": "b",
  "categoria": "grave",
  "gravidade": "media",
  "bo": "interessado",
  "definicao": "Comunicação violenta é qualquer forma de expressão verbal que agride, humilha, intimida, ameaça ou desrespeita o outro, seja de maneira direta ou sutil. Ela pode ocorrer por meio de insultos, gritos, ironias, sarcasmos, xingamentos, acusações infundadas, comentários discriminatórios ou qualquer fala que provoque constrangimento, medo ou sofrimento emocional. Importante destacar que a comunicação violenta não se limita ao conteúdo das palavras, mas também ao tom de voz, à intenção, ao contexto e ao impacto causado.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher os envolvidos e providenciar a mediação da situação de conflito, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso. Não relativize a situação.",
    "d": [
     "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento, quando julgar necessário;",
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima);",
     "Em ambos os casos, articular o acesso aos serviços da RAPS (Rede de Atenção Psicossocial), quando considerado que a vítima está em sofrimento emocional.",
     "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o",
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável);",
     "Se constatada omissão familiar no acompanhamento do estudante, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família."
    ]
   },
   {
    "k": "b",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/combinadas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar o chamado."
    ]
   },
   {
    "k": "c",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "d",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se as ações de CNV – Comunicação Não Violenta – estão presentes no referido documento.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperado.",
     "Em caso de necessidade, planejar ações complementares, principalmente se houver recorrência do tema entre os registros realizados na Plataforma Conviva."
    ]
   },
   {
    "k": "e",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes."
   },
   {
    "k": "f",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando couber."
   },
   {
    "k": "g",
    "t": "Orientar (formalmente / documentar) a família e/ou responsáveis pelos envolvidos sobre o registro de Boletim de Ocorrência (se caso de injúria, difamação ou similar)."
   },
   {
    "k": "h",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando parceria e diálogo para continuidade das tratativas de acolhimento, quando se fizer necessário, em ações integradas que promovam o acesso, atendimento e acompanhamento dos indivíduos, conforme o contexto."
   }
  ]
 },
 {
  "codigo": "4.13",
  "descricao": "Consumo de álcool e tabaco",
  "macro": "d",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "O consumo de álcool e tabaco refere-se ao uso, ingestão ou exposição de estudantes à bebidas alcoólicas ou produtos derivados do tabaco (cigarros, narguilé, cigarro eletrônico etc.), em desacordo com a legislação vigente e normas escolares.",
  "passos": [
   {
    "k": "a",
    "t": "Realizar o acolhimento e providenciar a mediação da situação."
   },
   {
    "k": "b",
    "t": "Conscientizar os envolvidos sobre as questões prejudiciais à saúde (deles e dos demais) diante do consumo dessas substâncias."
   },
   {
    "k": "c",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, cuidados e acompanhamento.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável);",
     "Se constatada omissão familiar ou violação de direitos da criança/adolescente por parte da família e/ou dos responsáveis, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família para a garantia de direitos.",
     "comércio de álcool/cigarro dentro ou próximo da escola;",
     "fornecimento realizado por adultos às crianças e aos adolescentes;",
     "situações de risco grave à saúde ou violência associada ao consumo."
    ]
   },
   {
    "k": "d",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma."
    ]
   },
   {
    "k": "e",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "f",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática em questão ou outras similares.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos;"
    ]
   },
   {
    "k": "g",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes."
   },
   {
    "k": "h",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da ação."
   },
   {
    "k": "i",
    "t": "Articular parcerias com os serviços da rede de saúde territorial, buscando diálogo e parceria em ações integradas que promovam a (in)formação, assim como, possibilitem o acesso e acompanhamento de pessoas em situação de sofrimento, caso necessário."
   },
   {
    "k": "j",
    "t": "Promover ação de conscientização coletiva na unidade escolar.",
    "d": [
     "Afixar nos espaços internos e externos da unidade escolar, placas informativas com as leis sobre a proibição de consumo de fumígenos em espaços públicos / escolares."
    ]
   }
  ]
 },
 {
  "codigo": "4.14",
  "descricao": "Consumo de cigarro eletrônico",
  "macro": "d",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "O cigarro eletrônico é um dispositivo eletrônico que produz vapor inalável contendo nicotina ou outras substâncias químicas, muitas vezes vendido como alternativa ao cigarro tradicional. No ambiente escolar, o uso ou porte de cigarros eletrônicos por estudantes configura infração às normas escolares e à legislação; representa risco à saúde física e mental; e pode estar associado ao acesso indevido a essas substâncias.",
  "passos": [
   {
    "k": "a",
    "t": "Realizar o acolhimento e providenciar a mediação da situação."
   },
   {
    "k": "b",
    "t": "Conscientizar os envolvidos sobre as questões prejudiciais à saúde (deles e dos demais) diante do consumo dessas substâncias."
   },
   {
    "k": "c",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, cuidados e acompanhamento.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável);",
     "Se constatada omissão familiar ou violação de direitos da criança/adolescente por parte da família e/ou dos responsáveis, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família para a garantia de direitos.",
     "comércio de cigarro eletrônico dentro ou próximo da escola;",
     "fornecimento por adultos às crianças e aos adolescentes;",
     "situações de risco grave à saúde ou violência associada ao consumo."
    ]
   },
   {
    "k": "d",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma."
    ]
   },
   {
    "k": "e",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "f",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática em questão ou outras similares.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos;"
    ]
   },
   {
    "k": "g",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes."
   },
   {
    "k": "h",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da ação."
   },
   {
    "k": "i",
    "t": "Articular parcerias com os serviços da rede de saúde territorial, buscando diálogo e parceria em ações integradas que promovam a (in)formação, assim como, possibilitem o acesso e acompanhamento de pessoas em situação de sofrimento, caso necessário."
   },
   {
    "k": "j",
    "t": "Promover ação de conscientização coletiva na unidade escolar.",
    "d": [
     "Afixar nos espaços internos e externos da unidade escolar, placas informativas com as leis sobre a proibição de consumo de fumígenos em espaços públicos / escolares."
    ]
   }
  ]
 },
 {
  "codigo": "4.15",
  "descricao": "Consumo de substâncias ilícitas",
  "macro": "d",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "Substâncias ilícitas são aquelas cuja produção, comercialização, posse ou uso são proibidos por lei, por representarem riscos à saúde pública ou à segurança. No contexto das políticas de saúde e educação, esse termo geralmente se refere a substâncias psicoativas que causam dependência e estão fora dos usos autorizados (como os medicinais ou científicos).",
  "passos": [
   {
    "k": "a",
    "t": "Realizar o acolhimento e providenciar a mediação da situação, evitando atitudes estigmatizantes, propondo uma escuta qualificada e sigilosa."
   },
   {
    "k": "b",
    "t": "Conscientizar os envolvidos sobre as questões prejudiciais à saúde (deles e dos demais) diante do consumo dessas substâncias."
   },
   {
    "k": "c",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, cuidados e acompanhamento.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável);",
     "Se constatada omissão familiar ou violação de direitos da criança/adolescente por parte da família e/ou dos responsáveis, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família para a garantia de direitos.",
     "comércio dentro ou próximo da escola (tráfico);",
     "fornecimento por adultos às crianças e aos adolescentes;",
     "situações de risco grave à saúde ou violência associada ao consumo."
    ]
   },
   {
    "k": "d",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma."
    ]
   },
   {
    "k": "e",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "f",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática em questão ou outras similares.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos;"
    ]
   },
   {
    "k": "g",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes.",
    "d": [
     "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da ação.",
     "Articular parcerias com os serviços da rede de saúde territorial, buscando diálogo e parceria em ações integradas que promovam a (in)formação, assim como, possibilitem o acesso e acompanhamento de pessoas em situação de sofrimento, caso necessário.",
     "Promover ação de conscientização coletiva na unidade escolar.",
     "Afixar nos espaços internos e externos da unidade escolar, placas informativas com as leis sobre a proibição de consumo de fumígenos em espaços públicos / escolares."
    ]
   }
  ]
 },
 {
  "codigo": "4.16",
  "descricao": "Crimes cibernéticos",
  "macro": "b",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "Crimes cibernéticos (ou crimes digitais) são condutas ilícitas praticadas por meio da internet, computadores, celulares ou outras tecnologias digitais, podendo envolver invasão de sistemas, roubo de dados, fraudes, além de situações que atingem diretamente estudantes e profissionais da educação, como cyberbullying, exposição de imagens íntimas, ameaças, discursos de ódio e discriminação online.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher a vítima e providenciar a mediação da situação de conflito, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso. Não relativize a situação.",
    "d": [
     "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento, quando necessário.",
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima).",
     "Em ambos os casos, articular o acesso aos serviços da RAPS (Rede de"
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável).",
     "Se constatada omissão familiar ou violação de direitos da criança/adolescente por parte da família e/ou dos responsáveis, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família para a garantia de direitos."
    ]
   },
   {
    "k": "c",
    "t": "Orientar a família da vítima quanto ao registro de Boletim de Ocorrência.",
    "d": [
     "O B.O. é indispensável quando a conduta se enquadrar em crime (ameaças, injúrias, racismo, pornografia infantil, divulgação de imagens íntimas, extorsão, entre outros).",
     "Cabe à vítima ou família: quando a violência é de natureza individual, dirigida a um estudante ou professor (ex.: difamação em rede social, exposição de imagens íntimas).",
     "Cabe à escola: quando a violência atinge a coletividade escolar (ex.: ataque a sistemas da escola, perfis falsos em nome da instituição, ameaças coletivas de violência). Circunstâncias prioritárias para registro imediato pela escola: o Ameaças de ataque ativo ou violência armada em redes sociais; o Criação de páginas, perfis ou grupos falsos envolvendo o nome da escola; o Casos de pornografia infantil (obrigatoriamente comunicados ao Conselho Tutelar e polícia); o Racismo, apologia ao nazismo ou outros crimes de ódio em ambiente digital vinculados à comunidade escolar."
    ]
   },
   {
    "k": "d",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação.",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma."
    ]
   },
   {
    "k": "e",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "f",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática de “Cyberbullying” e/ou temas similares ao contexto.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos;",
     "Promover espaços e momentos de escuta da comunidade escolar, para evitar o silenciamento."
    ]
   },
   {
    "k": "g",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes.",
    "d": [
     "Conscientizar a comunidade escolar sobre a Lei nº 13.185/2015 – Programa de Combate à Intimidação Sistemática (Bullying).",
     "Promover ações de coletividade e fortalecimento das relações.",
     "Planejar ações educativas com a turma sobre uso responsável da internet e cidadania digital.",
     "Apoiar a escola na criação de murais digitais com orientações sobre como denunciar e se proteger.",
     "Atuar como ponte de diálogo entre estudantes e gestão escolar, levando preocupações e sugestões.",
     "Estimular práticas de cultura de paz e empatia online, valorizando a convivência respeitosa também no espaço virtual."
    ]
   },
   {
    "k": "h",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da ação."
   },
   {
    "k": "i",
    "t": "Articular parcerias com os serviços da rede protetiva e do sistema de justiça, buscando diálogo para continuidade das tratativas de acolhimento – quando se fizer necessário – e em ações integradas que promovam a (in)formação, assim como, possibilitem o acesso e acompanhamento de pessoas em situação de sofrimento, caso necessário."
   }
  ]
 },
 {
  "codigo": "4.17",
  "descricao": "Dano ao patrimônio",
  "macro": "e",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "escola",
  "definicao": "O dano ao patrimônio é a destruição, deterioração, pichação ou depredação de bens materiais pertencentes à escola, à comunidade escolar (alunos, professores, funcionários) ou ao espaço público em geral. Pode incluir: quebra de móveis, portas, janelas, vidros; pichação ou vandalismo em paredes, banheiros e outros espaços; danificação de equipamentos tecnológicos (computadores, tablets, projetores); destruição de materiais pedagógicos, livros ou uniformes; incêndios ou atos de depredação coletiva.",
  "passos": [
   {
    "k": "a",
    "t": "Dialogar com os envolvidos e providenciar a mediação da situação de conflito, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso."
   },
   {
    "k": "b",
    "t": "Solicitar a presença dos responsáveis pelos estudantes envolvidos para ciência sobre o episódio e orientando sobre providências, direitos e deveres de cada lado.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável).",
     "Se constatada omissão familiar ou violação de direitos da criança/adolescente por parte da família e/ou dos responsáveis, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família para a garantia de direitos.",
     "Reparação simbólica ou material: Sempre que possível, promover acordo para reparo do dano (com apoio da família).",
     "Enfatizar a responsabilidade ética, não apenas a punição.",
     "Encaminhamentos externos: quando os danos forem graves, coletivos ou intencionais, pode ser necessária comunicação à Unidade Regional de Ensino, Conselho Tutelar ou órgãos policiais."
    ]
   },
   {
    "k": "c",
    "t": "Cabe ao Diretor Escolar e/ou representante oficial da equipe gestora, realizar o devido registro de Boletim de Ocorrência.",
    "d": [
     "Quando necessário, acionar o Polícia Militar por meio do telefone 190, em situações consideradas graves e/ou delito em flagrante (não encerrado);",
     "Preservar o espaço / item danificado para averiguações que se fizerem necessárias e ações da Polícia Técnico Científica, quando couber;"
    ]
   },
   {
    "k": "d",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário."
   },
   {
    "k": "e",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação.",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma."
    ]
   },
   {
    "k": "f",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática e/ou temas similares ao contexto."
   },
   {
    "k": "g",
    "t": "O Grêmio Estudantil é peça-chave na construção de uma cultura de pertencimento e cuidado coletivo, prevenindo a depredação."
   },
   {
    "k": "h",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da ação."
   }
  ]
 },
 {
  "codigo": "4.18",
  "descricao": "Envolvimento com tráfico de drogas ilícitas e psicoativas",
  "macro": "d",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "escola",
  "definicao": "O envolvimento com tráfico de drogas ilícitas e substâncias psicoativas no contexto escolar refere-se a situações em que estudantes ou pessoas do entorno: Comercializam, transportam ou distribuem drogas ilícitas; mantêm contato direto com grupos ou indivíduos envolvidos em práticas de tráfico; utilizam o espaço escolar para armazenamento ou venda de entorpecentes; sofrem aliciamento ou coação por organizações criminosas ligadas ao tráfico. Essas situações devem ser diferenciadas do uso/consumo pessoal de substâncias, que também exige acompanhamento, mas possui tratamento jurídico e pedagógico ",
  "passos": [
   {
    "k": "a",
    "t": "Realizar o acolhimento e providenciar a mediação da situação, evitando atitudes estigmatizantes, assegurando a integridade física e emocional dos estudantes envolvidos e da comunidade escolar, de maneira sigilosa, sem exposição.",
    "d": [
     "Documentar com clareza os fatos observados e relatos obtidos;",
     "Não cabe mediação direta entre o autor da denúncia e potencial vítima e/ou denunciante. Nesse caso, a escola deve priorizar os encaminhamentos oficiais e estabelecer ações conjuntas com a rede protetiva e serviços de segurança."
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, cuidados e acompanhamento.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, com conversa orientada sobre os riscos legais e sociais do envolvimento com o tráfico (com data e assinatura do responsável);",
     "Ofertar o acompanhamento pedagógico e socioemocional;",
     "Articular ações conjuntas junto ao Conselho Tutelar e outros serviços que integram a rede protetiva, de acordo com o contexto social do estudante / família envolvida."
    ]
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma.",
     "Houver indícios de tráfico (armazenamento, distribuição, comercialização, aliciamento).",
     "O espaço escolar for utilizado como ponto de tráfico.",
     "Houver flagrante de comercialização ou associação criminosa.",
     "Escola/direção: quando a ocorrência envolve a coletividade e atinge diretamente o ambiente escolar.",
     "Família/vítima: pode registrar quando o caso for de uso ou aliciamento individual, mas cabe à escola apoiar e orientar.",
     "Nunca agir de forma isolada ou colocar profissionais em risco.",
     "Preservar evidências e acionar imediatamente a rede de segurança pública."
    ]
   },
   {
    "k": "d",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios.",
     "Delegacia de Polícia – registro de ocorrência e investigações.",
     "DISE – Delegacia de Investigações sobre Entorpecentes (quando houver na região).",
     "Polícia Militar Escolar (via Ronda Escolar) / Polícia Civil para apuração formal.",
     "Conselho Tutelar – acompanhamento dos estudantes envolvidos.",
     "CREAS– atendimento de situações de vulnerabilidade ligadas ao tráfico.",
     "CRAS – apoio às famílias.",
     "Saúde (CAPS-AD, UBS e equipes de saúde da família) – acompanhamento de usuários de substâncias psicoativas.",
     "Ministério Público – quando a situação envolver crime organizado ou reincidência grave.",
     "Defensoria Pública – apoio jurídico às famílias."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática em questão ou outras similares.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados.",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos;"
    ]
   }
  ]
 },
 {
  "codigo": "4.19",
  "descricao": "Evasão escolar",
  "macro": "j",
  "categoria": "grave",
  "gravidade": "media",
  "bo": "nao",
  "definicao": "",
  "passos": [
   {
    "k": "a",
    "t": "Proposição de Ações de Monitoramento para identificar ausências frequentes por meio de registros e acompanhamentos sistemáticos.",
    "d": [
     "Entrar em contato com a família para compreender as causas da ausência e estimular o retorno às atividades escolares;",
     "Realizar reuniões com o estudante e seus responsáveis, garantindo um espaço de diálogo sem julgamentos, para escuta e acolhimento;",
     "Propor estratégias para apoiar o reingresso do estudante (atividades de compensação da aprendizagem, envolvimento em projetos pedagógicos/motivacionais)",
     "Elaborar / Planejar atividades de pertencimento, inserindo os estudantes em projetos culturais, esportivos e de protagonismo juvenil, que fortaleçam seu vínculo com a escola"
    ]
   },
   {
    "k": "b",
    "t": "Articular junto à rede protetiva, se identificado que a evasão escolar está relacionada à negligência, violência doméstica ou trabalho infantil, acionando também os órgãos de segurança, de acordo com cada cenário / situação. Para uma articulação adequada, se faz necessário que a equipe escolar esteja munida dos documentos mínimos a serem compartilhados com a rede de proteção, tais quais:",
    "d": [
     "Ficha de “busca ativa” individual, com registros de contatos estabelecidos (com ou sem sucesso) com a família ou responsáveis legais;",
     "Relatório pedagógico individual do estudante;",
     "Relatório de frequência individual do estudante;",
     "Atas de reuniões com a família / responsáveis;",
     "Potenciais notificações e tentativas de contato com a família / responsáveis;",
     "Relatório de potenciais ocorrências com envolvimento do estudante, reportando os fatos, as providências e a avaliação da equipe escolar se os resultados esperados foram alcançados;",
     "Atas das deliberações com os colegiados internos (Conselho de Escola) sobre ações estratégicas e alternativas para a prática de Busca Ativa (monitorada)."
    ]
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Vulnerabilidade socioeconômica e necessidade de trabalho precoce;",
     "Violência doméstica, negligência ou abandono familiar;",
     "Envolvimento com drogas, violência urbana ou grupos criminosos;",
     "Gravidez precoce, questões de saúde física ou mental;",
     "Sofrimento psíquico ou quadros de saúde mental;",
     "Desmotivação ou falta de pertencimento no ambiente escolar.",
     "Encartar as documentações das ações de monitoramento, assim como, os registros documentais de articulação junto a rede protetiva."
    ]
   },
   {
    "k": "d",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se ações com essa temática estão presentes no referido documento.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperado.",
     "Em caso de necessidade, planejar ações complementares, principalmente se houver recorrência do tema entre os registros realizados na Plataforma Conviva."
    ]
   },
   {
    "k": "e",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes.",
    "d": [
     "A parceria junto ao Grêmio Estudantil é fundamental para estabelecer a construção de uma cultura de acolhimento institucional na unidade escolar, tendo no colegiado democrático representativo dos estudantes, uma peça-chave na prevenção, fortalecimento de vínculos e promoção do pertencimento."
    ]
   },
   {
    "k": "f",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando parceria e diálogo para continuidade das tratativas de acolhimento, conforme o contexto.",
    "d": [
     "Comunicar o Conselho Tutelar sempre que aluno ultrapassar o limite de 30% de ausências, conforme previsto na lei nº 15.231/2025"
    ]
   }
  ]
 },
 {
  "codigo": "4.20",
  "descricao": "Fake news – disseminação de informações falsas",
  "macro": "j",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "",
  "passos": [
   {
    "k": "a",
    "t": "Acolher a vítima (quando houver) e providenciar a mediação da situação de conflito, realizando a escuta ativa e qualificada. Não relativize a situação.",
    "d": [
     "Checar a veracidade do conteúdo junto às fontes oficiais (Secretaria da Educação, órgãos de segurança, gestão escolar).",
     "Acolher comunidade escolar em caso de boatos que gerem medo ou pânico, oferecer comunicação clara e transparente.",
     "Documentar o episódio, descrevendo como a fake news circulou no ambiente escolar e quais os seus impactos.",
     "Quando houver vítima (s), agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento.",
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima).",
     "Em ambos os casos, articular o acesso aos serviços da RAPS (Rede de"
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável).",
     "Se constatada omissão familiar ou violação de direitos da criança/adolescente por parte da família e/ou dos responsáveis, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família para a garantia de direitos."
    ]
   },
   {
    "k": "c",
    "t": "Registrar o Boletim de Ocorrência nas seguintes situações:",
    "d": [
     "O B.O. é indispensável quando a conduta se enquadrar em crime (ameaças, injúrias, racismo, pornografia infantil, divulgação de imagens íntimas, extorsão, entre outros).",
     "Cabe à vítima ou família: quando a violência é de natureza individual, dirigida a um estudante ou professor (ex.: difamação em rede social, exposição de imagens íntimas).",
     "Cabe à escola: quando a violência atinge a coletividade escolar (ex.: ataque a sistemas da escola, perfis falsos em nome da instituição, ameaças coletivas de violência). Circunstâncias prioritárias para registro imediato pela escola: o Ameaças de ataque ativo ou violência armada em redes sociais; o Criação de páginas, perfis ou grupos falsos envolvendo o nome da escola; o Casos de pornografia infantil (obrigatoriamente comunicados ao Conselho Tutelar e polícia); o Racismo, apologia ao nazismo ou outros crimes de ódio em ambiente digital vinculados à comunidade escolar.",
     "Boatos de ataques à escola ou ameaças virtuais (neste caso, seguir os procedimentos do item “Ameaça de Ataque Ativo”)",
     "Difamação de estudantes, professores ou gestores;",
     "Circulação de informações falsas sobre regras, programas ou políticas educacionais;",
     "Divulgação de conteúdos discriminatórios ou preconceituosos como se fossem verdadeiros."
    ]
   },
   {
    "k": "d",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação.",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma."
    ]
   },
   {
    "k": "e",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "f",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática e/ou temas similares ao contexto.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos;"
    ]
   },
   {
    "k": "g",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes.",
    "d": [
     "Planejar ações educativas com a turma sobre uso responsável da internet e cidadania digital;",
     "Auxiliar na promoção da cultura de checagem, responsabilidade digital e combate à desinformação."
    ]
   },
   {
    "k": "h",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da ação.",
    "d": [
     "Delegacia de Polícia – registro de ocorrência e investigações;",
     "DCCIBER – ou Delegacias especializadas em crimes cibernéticos, quando houver;",
     "Polícia Militar Escolar (via Ronda Escolar) / Polícia Civil para apuração formal.",
     "Conselho Tutelar – quando houver estudantes envolvidos na criação ou",
     "CRAS/CREAS – no acompanhamento de famílias em situações de vulnerabilidade",
     "Ministério Público – nos casos de crimes digitais graves, reincidências ou quando"
    ]
   }
  ]
 },
 {
  "codigo": "4.21",
  "descricao": "Feminicídio",
  "macro": "b",
  "categoria": "urgencia",
  "gravidade": "urgencia",
  "bo": "escola",
  "definicao": "Feminicídio é a forma mais extrema de violência de gênero contra a mulher, caracterizada pelo assassinato motivado pela condição de a vítima ser mulher. No Brasil, os casos mais comuns incidem sobre a prática de violência doméstica e familiar e o menosprezo ou discriminação à condição de mulher.",
  "passos": [
   {
    "k": "a",
    "t": "Em se tratando de ocorrência no ambiente escolar:",
    "d": [
     "Observar os sinais vitais da vítima e sentidos (dores) da vítima.",
     "Em caso de homicídio tentado (lesão corporal grave) acionar o Corpo de Bombeiros, por meio do telefone de emergência 193, para providenciar o socorro;",
     "Isolar o local dos fatos, sem alteração ou remoção do corpo, até que seja autorizado pela autoridade de Plantão no Distrito Policial, que poderá solicitar a perícia do local (Polícia Técnico Científica);",
     "Acionar a Polícia Militar, por meio do Botão do Pânico e/ou telefone de emergência 190, a fim de preservar o local, lavrar o Boletim de Ocorrência e posterior encaminhamento ao Distrito Policial;",
     "A autoridade de Plantão deverá solicitar ao IML a remoção do corpo para fins de laudo.",
     "O comparecimento da Polícia Militar no Pronto Socorro ou Hospital é anterior à ida ao Distrito Policial para condução da ocorrência à Autoridade Competente.",
     "Acionar a família e/ou responsáveis legais da vítima."
    ]
   },
   {
    "k": "b",
    "t": "No caso de ter havido o socorro, o comparecimento ao Pronto Socorro ou Hospital da Área é obrigatório:",
    "d": [
     "ao responsável da vítima em questão;",
     "ao representante da Unidade Escolar / Unidade Regional de Ensino."
    ]
   },
   {
    "k": "c",
    "t": "Preservar imediatamente as imagens captadas do fato pelo sistema de videomonitoramento."
   },
   {
    "k": "d",
    "t": "Para os casos de Tentativa de Feminicídio devem ser seguidas as mesmas orientações de lesão corporal (socorro, preservação do local, cautela com as imagens, dentre outras ações)."
   },
   {
    "k": "e",
    "t": "Informar a Unidade Regional de Ensino - Supervisor da Unidade Escolar/ Dirigente Regional de Ensino."
   },
   {
    "k": "f",
    "t": "Ao término dos procedimentos registrar a ocorrência na Plataforma Conviva, com dados do Boletim de Ocorrência."
   },
   {
    "k": "g",
    "t": "Articular parcerias com a rede protetiva para acolhimento da família da vítima."
   },
   {
    "k": "h",
    "t": "Elaborar relatório circunstanciado a ser encaminhado para a URE / Conviva Central."
   },
   {
    "k": "i",
    "t": "Se ato cometido dentro – os nas imediações – da unidade escolar, verificar junto à equipe regional (URE) em consonância com a equipe central (SEDUC/SP) quanto aos desdobramentos e orientações sobre potenciais casos de suspensão das atividades pedagógicas, assim como, as ações de acolhimento emocional e institucional que se fizerem necessárias.",
    "d": [
     "Verificar se as recomendações de segurança desse presente documento foram seguidas corretamente.",
     "Verificar o Plano de Contingência da unidade escolar contempla ações para invasões externas.",
     "Analisar se as estratégias e ações previstas e estabelecidas em documento foram atendidas em conformidade com o proposto.",
     "Avaliar a necessidade de ajustes e revisão dos atos planejados.",
     "Atentar-se às orientações de documento orientador sobre Ataque Ativo em ambientes escolares (ou equivalente) e seguir as orientações encartadas"
    ]
   },
   {
    "k": "j",
    "t": "Se ato cometido fora da unidade escolar, mas com envolvimento de integrantes da equipe escolar, idem ao item anterior, atentando-se também às orientações da SSP."
   },
   {
    "k": "k",
    "t": "Se ato comunicado à equipe escolar, mas não efetuado no espaço físico da unidade, seguir as orientações das autoridades de segurança (SSP) e planejar ações de acolhimento emocional da equipe escolar que se fizerem necessárias."
   }
  ]
 },
 {
  "codigo": "4.22",
  "descricao": "Furto",
  "macro": "e",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "Furto é a subtração de coisa móvel alheia, sem o uso de violência ou grave ameaça, praticada para si ou para outrem. A diferença central em relação ao roubo é que o furto ocorre de forma clandestina, sem intimidação direta à vítima.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher a vítima (quando houver) e providenciar a mediação da situação de conflito, realizando a escuta ativa e qualificada. Não relativize a situação.",
    "d": [
     "A equipe deve agir de maneira cuidadosa, preservando o sigilo e evitando exposições indevidas;",
     "Em situações de suspeita, é essencial realizar escuta atenta e não promover constrangimento público do estudante;",
     "Procedimentos de mediação e diálogo podem ser aplicados quando houver dúvidas sobre o ocorrido (ex.: objetos que possam ter sido perdidos ou trocados por engano).",
     "Em casos confirmados de furto, deve-se comunicar a família e avaliar a necessidade de encaminhamentos legais, priorizando sempre a reparação e a responsabilização formativa.",
     "Promover reflexões coletivas, em reuniões pedagógicas ou ações educativas, para reforçar valores como respeito, solidariedade e cuidado com o bem comum."
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres."
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação.",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma.",
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável);",
     "Orientar às famílias quanto ao registro de Boletim de Ocorrência e acompanhar os responsáveis, quando necessário."
    ]
   },
   {
    "k": "d",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário."
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática e/ou temas similares ao contexto.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos."
    ]
   },
   {
    "k": "f",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes.",
    "d": [
     "Planejar ações educativas com a turma sobre uso responsável da internet e cidadania digital;",
     "Auxiliar na promoção da cultura de checagem, responsabilidade digital e combate à desinformação."
    ]
   },
   {
    "k": "g",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da ação.",
    "d": [
     "Delegacia de Polícia – registro de ocorrência e investigações;",
     "Polícia Militar Escolar (via Ronda Escolar) / Polícia Civil para apuração formal.",
     "Conselho Tutelar – em situações em envolvam menores de 18 anos.",
     "CREAS – quando houver reincidência ou necessidade de acompanhamento",
     "Ministério Público e Vara da Infância e da Juventude – em casos mais graves ou"
    ]
   }
  ]
 },
 {
  "codigo": "4.23",
  "descricao": "Gordofobia",
  "macro": "b",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "Gordofobia é a discriminação, preconceito ou exclusão direcionada a pessoas em razão do seu corpo ou peso, manifestada por atitudes, insultos, piadas, exclusão e estigmatização no ambiente escolar. Uma forma de violência que afeta a dignidade, a autoestima e os direitos das pessoas, devendo ser enfrentada de modo educativo, inclusivo e com respeito.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher a vítima e providenciar a mediação da situação de conflito, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso. Não relativize a situação. Não promova revitimização.",
    "d": [
     "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento, quando necessário.",
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima).",
     "Em ambos os casos, articular o acesso aos serviços da RAPS (Rede de"
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável).",
     "Se constatada omissão familiar ou violação de direitos da criança/adolescente por parte da família e/ou dos responsáveis, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família para a garantia de direitos."
    ]
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/combinadas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar o chamado."
    ]
   },
   {
    "k": "d",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que contemplem essa temática.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos."
    ]
   },
   {
    "k": "f",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes."
   },
   {
    "k": "g",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da discriminação."
   },
   {
    "k": "h",
    "t": "Articular parcerias com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando diálogo para continuidade das tratativas de acolhimento – quando se fizer necessário – e em ações integradas que promovam a (in)formação, assim como, possibilitem o acesso e acompanhamento de pessoas em situação de sofrimento, caso necessário."
   }
  ]
 },
 {
  "codigo": "4.24",
  "descricao": "Homicídio / homicídio tentado",
  "macro": "b",
  "categoria": "urgencia",
  "gravidade": "urgencia",
  "bo": "escola",
  "definicao": "Homicídio é a conduta pela qual uma pessoa tira a vida de outra. No direito penal brasileiro, está previsto no artigo 121 do Código Penal",
  "passos": [
   {
    "k": "a",
    "t": "Observar os sinais vitais da vítima e sentidos (dores) da vítima."
   },
   {
    "k": "b",
    "t": "Isolar o local dos fatos, sem alteração ou remoção do corpo.",
    "d": [
     "A Autoridade de Plantão no Distrito Policial, poderá solicitar a perícia do local (Polícia Técnico Científica)."
    ]
   },
   {
    "k": "c",
    "t": "Em caso de homicídio tentado (lesão corporal grave) acionar o Corpo de Bombeiros, por meio do telefone de emergência 193, para providenciar o socorro."
   },
   {
    "k": "d",
    "t": "Acionar a Polícia Militar, por meio do telefone de emergência 190 e/ou do Botão do Pânico, conforme a urgência da situação, a fim de preservar o local, Lavrar Boletim de Ocorrência e posterior encaminhamento ao Distrito Policial.",
    "d": [
     "A Autoridade de Plantão deverá solicitar ao IML a remoção do corpo para fins de laudo;",
     "O comparecimento da Polícia Militar no Pronto Socorro ou Hospital é anterior à ida ao Distrito Policial para condução da ocorrência à Autoridade Competente.",
     "Homicídio simples (art. 121, caput, CP).",
     "Homicídio privilegiado (art. 121, §1º, CP): quando o agente comete sob forte",
     "Homicídio qualificado (art. 121, §2º, CP): quando praticado com agravantes, como",
     "Homicídio culposo (art. 121, §3º, CP): quando não há intenção de matar, mas o"
    ]
   },
   {
    "k": "e",
    "t": "Acionar os responsáveis da vítima."
   },
   {
    "k": "f",
    "t": "No caso de ter havido o socorro, o comparecimento ao Pronto Socorro ou Hospital da Área é obrigatório:",
    "d": [
     "ao responsável da vítima em questão;",
     "ao representante da Unidade Escolar / Unidade Regional de Ensino."
    ]
   },
   {
    "k": "g",
    "t": "Informar a Unidade Regional de Ensino - Supervisor da Unidade Escolar/ Dirigente Regional de Ensino."
   },
   {
    "k": "h",
    "t": "Preservar imediatamente as imagens captadas do fato pelo sistema de videomonitoramento."
   },
   {
    "k": "i",
    "t": "Ao término dos procedimentos registrar a ocorrência na Plataforma Conviva, com dados do Boletim de Ocorrência."
   },
   {
    "k": "j",
    "t": "Para os casos de Tentativa de Homicídio devem ser seguidas as mesmas orientações de lesão corporal (socorro, preservação do local, cautela com as imagens, dentre outras ações)."
   },
   {
    "k": "k",
    "t": "Articular parcerias com a rede protetiva para acolhimento da família da vítima."
   },
   {
    "k": "l",
    "t": "Elaborar relatório circunstanciado a ser encaminhado para a URE / Conviva Central."
   },
   {
    "k": "m",
    "t": "Se ato cometido dentro – os nas imediações – da unidade escolar, verificar junto à equipe regional (URE) em consonância com a equipe central (SEDUC/SP) quanto aos desdobramentos e orientações sobre potenciais casos de suspensão das atividades pedagógicas, assim como, as ações de acolhimento emocional e institucional que se fizerem necessárias.",
    "d": [
     "Verificar se as recomendações de segurança do presente documento foram seguidas corretamente;",
     "Verificar o Plano de Contingência da unidade escolar contempla ações para invasões externas;",
     "Analisar se as estratégias e ações previstas e estabelecidas em documento foram atendidas em conformidade com o proposto;",
     "Avaliar a necessidade de ajustes e revisão dos atos planejados;",
     "Atentar-se às orientações de documento orientador sobre Ataque Ativo em ambientes escolares (ou equivalente) e seguir as orientações encartadas."
    ]
   },
   {
    "k": "n",
    "t": "Se ato cometido fora da unidade escolar, mas com envolvimento de integrantes da equipe escolar, idem ao item anterior, atentando-se também às orientações da SSP."
   },
   {
    "k": "o",
    "t": "Se ato comunicado à equipe escolar, mas não efetuado no espaço físico da unidade, seguir as orientações das autoridades de segurança (SSP) e planejar ações de acolhimento emocional da equipe escolar."
   }
  ]
 },
 {
  "codigo": "4.25",
  "descricao": "Homofobia",
  "macro": "b",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "Homofobia é a discriminação, rejeição ou violência dirigida a pessoas em razão de sua orientação sexual real ou presumida, manifestada por atitudes, palavras, práticas institucionais ou estruturas sociais que reforçam desigualdades e exclusões. Ela pode se manifestar de forma individual por meio de ofensas, agressões e intimidações, além de normas e práticas que marginalizam pessoas LGBTQIA+. Em síntese: a homofobia é uma violação de direitos humanos, reconhecida no Brasil como crime, equiparada ao racismo.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher a vítima de homofobia e providenciar a mediação da situação de conflito, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso. Não relativize a situação e não promova revitimização.",
    "d": [
     "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento;",
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima);",
     "Em ambos os casos, articular o acesso aos serviços da RAPS (Rede de"
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável).",
     "Se constatada omissão familiar ou violação de direitos da criança/adolescente por parte da família e/ou dos responsáveis, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família para promover a garantia de direitos da criança/adolescente."
    ]
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/combinadas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar o chamado."
    ]
   },
   {
    "k": "d",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios. O Estatuto da Criança e do Adolescente (ECA) reconhece que qualquer forma Desde a decisão do Supremo Tribunal Federal (STF) em 2019, atos de Essas medidas têm caráter educativo e restaurativo, buscando reeducar o"
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática “Preconceitos / Homofobia”.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos."
    ]
   },
   {
    "k": "f",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes.",
    "d": [
     "Elaborar ações que promovam o respeito à diversidade sexual"
    ]
   },
   {
    "k": "g",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da discriminação."
   },
   {
    "k": "h",
    "t": "Orientar (formalmente / documentar) a família e/ou responsáveis pelos envolvidos sobre o registro de Boletim de Ocorrência, acompanhando até a delegacia, quando necessário."
   },
   {
    "k": "i",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando parceria e diálogo para continuidade das tratativas de acolhimento, quando se fizer necessário, em ações integradas que promovam o acesso, atendimento e acompanhamento dos indivíduos, conforme o contexto."
   }
  ]
 },
 {
  "codigo": "4.26",
  "descricao": "Importunação sexual / estupro",
  "macro": "c",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "Importunação sexual é a prática de ato libidinoso contra alguém sem o seu consentimento, com intuito de satisfazer desejo próprio ou alheio. Ex.: toques, apalpadas, beijos forçados em espaços coletivos. Estupro é conjunção carnal ou prática de outro ato libidinoso mediante violência ou grave ameaça. Já o estupro de vulnerável é a conjunção carnal ou ato libidinoso com menor de 14 anos ou pessoa incapaz de consentir.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher a vítima imediatamente, preferencialmente por profissional do mesmo gênero, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso. Não relativize a situação. Proteja a vítima!",
    "d": [
     "Atentar-se ao acolhimento adequado que não promova revitimização (repetição do relato de maneira que se reviva o trauma da vítima);",
     "NUNCA realizar acareação entre a vítima e o potencial agressor;",
     "Agendar a atuação do Psicólogo da Educação para acolhimento da vítima;",
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima);",
     "Mantenha o sigilo sobre o episódio, preservando a vítima e potenciais constrangimentos;",
     "Situações dessa natureza não devem ser tratadas apenas com mediação interna, pois constituem crimes graves, comunique a direção escolar e os órgãos competentes."
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família;",
     "Recomenda-se que o servidor que realizou o primeiro acolhimento / escuta da denúncia junto a vítima participe do diálogo para relatar o episódio, para que seja preservada a integridade emocional vítima (evite a revitimização);",
     "Evitar qualquer exposição da vítima no ambiente escolar.",
     "A equipe escolar deverá orientar a família da vítima quanto o registro do Boletim de Ocorrência, que sempre deverá ser realizado em situações dessa gravidade (estupro). Em caso de necessidade, um representante da equipe gestora deverá acompanhar a família até a Delegacia mais próxima.",
     "Em casos de flagrante ou de suspeita fundamentada, a escola deve comunicar imediatamente a polícia e o Conselho Tutelar. o Polícia Civil (Delegacia de Defesa da Mulher – DDM, quando houver) – para registro e investigação. o Polícia Militar – em casos de flagrante. o Conselho Tutelar – sempre que envolver menores de 18 anos para medidas protetivas. o Ministério Público e Vara da Infância e Juventude – para acompanhamento judicial. o CREAS – atendimento psicossocial à vítima e a à família. o CRAS – quando famílias em situação de vulnerabilidade. o Unidades de Saúde – atendimento médico imediato e cuidados preventivos (profilaxia de ISTs, anticoncepção de emergência)."
    ]
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações previstas/planejadas no âmbito de ações pedagógicas e restaurativas, no que tange o cuidado com a vítima;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir chamado na plataforma – principalmente no que tange a articulação junto à rede protetiva."
    ]
   },
   {
    "k": "d",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens, áudios ou similares."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática e/ou similares em suas diversas manifestações.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Em caso de necessidade, planejar ações complementares, principalmente se houver recorrência do tema entre os registros realizados na Plataforma Conviva.",
     "Promover espaços e momentos de escuta da comunidade escolar, para evitar o silenciamento."
    ]
   },
   {
    "k": "f",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da agressão.",
    "d": [
     "Em caso de envolvimento apenas entre servidores públicos, não há registro em plataforma, mas deverão ser seguidos os demais procedimentos até o envio de relatório para a URE, quando compreender-se que não há condições de mediação possíveis pela equipe local.",
     "Todo caso de crime contra a Dignidade Sexual envolvendo servidor deverá ser encaminhado para Controladoria Geral do Estado de São Paulo (CGE/SP)."
    ]
   },
   {
    "k": "g",
    "t": "Articular projetos pedagógicos com a equipe docente para a promoção de ações educativas e letramento sobre as diferenças entre abuso, assédio e importunação sexual, assim como, educação sexual, em consonância com a BNCC.",
    "d": [
     "Quando possível, articular parcerias com DDM para ações complementares na U.E., na busca pela mitigação de novos casos."
    ]
   }
  ]
 },
 {
  "codigo": "4.27",
  "descricao": "Incitamento e associação a atos infracionais / crimes",
  "macro": "b",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "Incitamento a atos infracionais ou crimes consiste em incentivar, estimular ou persuadir terceiros a praticar delitos ou atos ilícitos, podendo envolver violência, depredação, uso de drogas ou condutas contrárias à lei. A mediação interna é adequada apenas para casos de menor potencial ofensivo, com caráter educativo e preventivo.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher os envolvidos e providenciar a mediação da situação de conflito, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso.",
    "d": [
     "Analisar o cenário e seguir as orientações em consonância da tipificação infracional identificada em momento de escuta, caso identificada uma situação de alta gravidade; o Situações de incitamento a crimes graves não devem ser resolvidas apenas por mediação interna; a prioridade é acolhimento da comunidade escolar, proteção das vítimas e comunicação às autoridades competentes; o Para casos de menor potencial ofensivo, podem ser aplicadas ações pedagógicas preventivas."
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável).",
     "Orientar (formalmente / documentar) a família e/ou responsáveis pelos envolvidos sobre o registro de Boletim de Ocorrência, acompanhando até a delegacia, quando necessário."
    ]
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/combinadas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar o chamado.",
     "Divulgação ou incentivo a bullying, vandalismo, furtos ou roubos;",
     "Estímulo ao consumo de drogas ou envolvimento com tráfico;",
     "Criação de grupos ou organizações voltadas à prática de delitos ou intimidação de colegas."
    ]
   },
   {
    "k": "d",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática “Preconceitos / Homofobia”.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos."
    ]
   },
   {
    "k": "f",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da discriminação."
   },
   {
    "k": "g",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando parceria e diálogo para continuidade das tratativas de acolhimento, quando se fizer necessário, em ações integradas que promovam o acesso, atendimento e acompanhamento dos indivíduos, conforme o contexto."
   }
  ]
 },
 {
  "codigo": "4.28",
  "descricao": "Indisciplina",
  "macro": "h",
  "categoria": "administrativa",
  "gravidade": "leve",
  "bo": "nao",
  "definicao": "Indisciplina refere-se a comportamentos de desrespeito às normas, regras e rotinas da escola, que comprometem a convivência, a aprendizagem e a organização do ambiente escolar. Exemplos incluem: o uso inadequado de materiais ou recursos pedagógicos, comportamentos que perturbam o desenvolvimento das atividades pedagógicas ou atrasos recorrentes. Diferencia-se de atos infracionais/criminais, pois não envolve violência física ou crimes, podendo ser tratada prioritariamente de forma pedagógica.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher os envolvidos e providenciar a mediação da situação de conflito, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso.",
    "d": [
     "Compreender as causas do comportamento indisciplinado, evitando punições automáticas;",
     "Promover conversas entre o estudante, professores e, quando necessário, a família, buscando diálogo e mediação;",
     "Reforçar as normas e valores da escola no ambiente escolar, dentro e fora da sala de aula;",
     "Orientar sobre respeito, empatia e convivência democrática."
    ]
   },
   {
    "k": "b",
    "t": "Se necessário, dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável).",
     "Estabelecer um plano de acompanhamento com estratégias individuais para estudantes com episódios recorrentes, envolvendo família e profissionais de apoio pedagógico ou psicossocial."
    ]
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/combinadas;",
     "Manter o registro das ocorrências em dia, documentando e acompanhando incidentes recorrentes."
    ]
   }
  ]
 },
 {
  "codigo": "4.29",
  "descricao": "Invasão",
  "macro": "e",
  "categoria": "urgencia",
  "gravidade": "urgencia",
  "bo": "escola",
  "definicao": "Invasão refere-se à entrada não autorizada de pessoas em dependências escolares, sem permissão da direção ou responsável legal pela unidade, podendo ocorrer com diferentes finalidades. Diferencia-se de simples presença inadequada ou desobediência interna, pois envolve violação do espaço institucional, como: acesso de estranhos à escola ou entrada de indivíduos com intenção de causar danos ou cometer delitos; ou presença não autorizada de pessoas em eventos ou áreas restritas da escola.",
  "passos": [
   {
    "k": "a",
    "t": "Solicitar que a pessoa se retire do espaço escolar, mas nunca abordar ou confrontar a pessoa estranha sozinho(a)."
   },
   {
    "k": "b",
    "t": "Acionar o Botão do Pânico e/ou ligar no 190, para intervenção imediata que garanta a segurança da comunidade escolar."
   },
   {
    "k": "c",
    "t": "Registrar Boletim de Ocorrência."
   },
   {
    "k": "d",
    "t": "Informar a Supervisão / Unidade Regional de Ensino."
   },
   {
    "k": "e",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento.",
    "d": [
     "Preservar demais evidências em caso danos ao patrimônio."
    ]
   },
   {
    "k": "f",
    "t": "Registrar a ocorrência na Plataforma Conviva, com dados do Boletim de Ocorrência."
   },
   {
    "k": "g",
    "t": "Consultar o “Plano de Contingência” para verificar os procedimentos e ações para situações e invasão do território escolar.",
    "d": [
     "Avaliar se as ações do Plano vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares, reforçando as regras de acesso, controle de entradas e orientações sobre segurança."
    ]
   },
   {
    "k": "h",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da discriminação."
   }
  ]
 },
 {
  "codigo": "4.30",
  "descricao": "Mal súbito",
  "macro": "j",
  "categoria": "urgencia",
  "gravidade": "urgencia",
  "bo": "avaliar",
  "definicao": "Mal súbito é qualquer ocorrência de mal-estar ou alteração súbita do estado de saúde de um estudante, profissional ou visitante da escola, um evento de emergência médica que exige atendimento rápido e seguro. A escola deve agir com acolhimento, primeiros socorros e acionamento da rede de saúde, garantindo segurança e acompanhamento da vítima, em situações como: desmaios ou síncope; crises convulsivas; reações alérgicas graves (anafilaxia); hipoglicemia ou problemas relacionados a doenças crônicas (diabetes, asma); infartos ou problemas cardiovasculares emergenciais; etc. Realizar o acolhimento",
  "passos": [
   {
    "k": "a",
    "t": "Em caso de necessidade de condução ao Pronto Atendimento ou Hospital:",
    "d": [
     "A vítima deverá ser acompanhada por um representante da equipe gestora + um acompanhante para prestar cuidados e zelar pela integridade física;",
     "A família / responsável legal deverá ser previamente informada/comunicada sobre o endereço do deslocamento."
    ]
   },
   {
    "k": "b",
    "t": "Em caso de mal súbito resultado em morte:",
    "d": [
     "Verificar os sinais vitais da vítima;",
     "Isolar o local dos fatos, sem alteração ou remoção do corpo;",
     "Acionar a Polícia Militar, por meio do telefone de emergência 190 ou “Botão do Pânico”, a fim de preservar o local;",
     "Seguir as orientações previstas na categoria “óbito” desse documento orientador;",
     "Acionar os responsáveis da vítima;",
     "Lavrar Boletim de Ocorrência e posterior encaminhamento ao Distrito Policial;",
     "Informar a Unidade Regional de Ensino - Supervisor da Unidade Escolar;",
     "Preservar as imagens captadas do fato pelo sistema de videomonitoramento."
    ]
   },
   {
    "k": "c",
    "t": "Ao término dos procedimentos registrar a ocorrência na Plataforma Conviva, com dados do Boletim de Ocorrência."
   }
  ]
 },
 {
  "codigo": "4.31",
  "descricao": "Óbito",
  "macro": "j",
  "categoria": "urgencia",
  "gravidade": "urgencia",
  "bo": "escola",
  "definicao": "Óbito refere-se ao falecimento de um estudante, profissional ou membro da comunidade escolar durante sua permanência (mal súbito) ou em decorrência de circunstâncias relacionadas à escola (acidentes ou eventos externos que afetem diretamente as atividades escolares).",
  "passos": [
   {
    "k": "a",
    "t": "Manter a calma, verificar os sinais vitais da vítima, assim como, consciência e respiração"
   },
   {
    "k": "b",
    "t": "Acionar os serviços de emergência: ligar para o SAMU (192), Corpo de Bombeiros (193) e Polícia Militar (190)"
   },
   {
    "k": "c",
    "t": "Acionar os responsáveis / família da vítima."
   },
   {
    "k": "d",
    "t": "Isolar o local dos fatos, sem alteração ou remoção do corpo.",
    "d": [
     "A autoridade de plantão no Distrito Policial, poderá solicitar a perícia do local (Polícia Técnico Científica) e, posteriormente, deverá solicitar ao IML a remoção do corpo para fins de laudo;",
     "Registrar o Boletim de Ocorrência e posterior encaminhamento ao Distrito Policial.",
     "No caso de ter havido o socorro, o comparecimento ao Pronto Socorro ou Hospital da Área é obrigatório: o ao responsável da vítima em questão; o ao representante da Unidade Escolar / Unidade Regional de Ensino."
    ]
   },
   {
    "k": "e",
    "t": "Informar a Unidade Regional de Ensino – Supervisor da Unidade Escolar."
   },
   {
    "k": "f",
    "t": "Elaborar relatório circunstanciado a ser encaminhado para a URE / Conviva Central."
   },
   {
    "k": "g",
    "t": "Verificar junto à equipe regional (URE) em consonância com a equipe central (SEDUC/SP) quanto aos desdobramentos e orientações sobre potenciais casos de suspensão das atividades pedagógicas, assim como, as ações de acolhimento emocional e institucional que se fizerem necessárias."
   },
   {
    "k": "h",
    "t": "Realizar o acolhimento imediato da comunidade escolar: equipe pedagógica, psicólogos e gestores devem prestar suporte emocional a estudantes e profissionais."
   },
   {
    "k": "i",
    "t": "Comunicar a comunidade escolar sobre o falecimento de forma sensível."
   },
   {
    "k": "j",
    "t": "Planejar ações pedagógicas voltadas a temática do luto, oferecendo apoio psicológico, rodas de conversa e orientações sobre manejo de perdas."
   },
   {
    "k": "k",
    "t": "Evitar especulações ou exposição indevida sobre a vítima."
   }
  ]
 },
 {
  "codigo": "4.32",
  "descricao": "Ocupação de unidade escolar",
  "macro": "e",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "",
  "passos": [
   {
    "k": "a",
    "t": "Ao receber a informação e/ou ameaça de que a unidade escolar será ocupada por estudantes, siga os seguintes passos: → Informação de ação via telefone (fixo ou celular): Identificar o número e, quando possível, gravar a conversa; → Informação de ação via redes sociais (Instagram, Facebook, TikTok, entre outras): Fazer capturas de tela das mensagens; → Informação de ação via fanzines, boletins e panfletagens: Identificar os autores do material distribuído e acionar os responsáveis quando houver estudantes envolvidos; → Informação via imprensa: Verificar a veracidade da fonte e informar a ASCOM. Análise de Cenário para reconhecer um Ato de Ocupação Critério Invasão Ocupação Pode haver (em parte ou Autorização legal Não há totalmente) Pode ser reconhecida social Reconhecimento Geralmente considerada ilegal ou politicamente Uso reivindicatório, político Intenção Tomada forçada de espaço ou funcional Construção irregular em terreno Movimentos sociais ou Exemplo típico público manifestações Atos infracionais cometidos por Encaminhamentos DAI25 (se houver) adolescentes conforme o ECA"
   },
   {
    "k": "b",
    "t": "Ações Imediatas: → Informar a Unidade Regional de Ensino; → Solicitar ao Grêmio que faça interlocução com os estudantes para ouvi-los e tentar solucionar a situação, sem prejuízos em aulas ou potenciais danos ao patrimônio; → Oficiar a Polícia Militar informando o caso e solicitando apoio policial, especificando local, data e horários em que a unidade escolar necessitará de apoio/reforço; → Confirmar se os itens de segurança estão funcionando adequadamente (portões, câmeras e alarmes); → Articular junto ao Grêmio Estudantil ações de conscientização, alertando sobre as consequências que uma invasão/ocupação pode gerar e as questões de segurança individual e coletiva a serem preservadas e monitoradas.",
    "d": [
     "A ocupação não pode colocar em risco a segurança de estudantes e profissionais.",
     "Se houver dano ao patrimônio: aplica-se o Art. 163 do Código Penal (dano qualificado, se contra bem público).",
     "Se houver impedimento de acesso ou coação: pode incidir o Art. 146 do CP (constrangimento ilegal) ou Art. 147 do CP (ameaça).",
     "Se houver violência ou tumulto: pode configurar Art. 286 (incitação ao crime) ou Art. 331 (desacato), mas a escola deve agir com cautela, sempre preservando o direito à manifestação."
    ]
   },
   {
    "k": "c",
    "t": "Em caso de Ocupação: → Verificar se há pessoas coagidas sendo mantidas no local, o número de envolvidos, as respectivas reivindicações e se há feridos e/ou pessoas necessitando de atendimento médico; → Monitorar a movimentação da comunidade escolar pelas câmeras com o intuito de resguardar a segurança dos estudantes e demais integrantes da comunidade escolar envolvidos nas ações; → Informar a Unidade Regional de Ensino - Supervisor da Unidade Escolar; → Solicitar apoio/reforço da Polícia Militar via ofício, especificando local, data e horário em que a unidade escolar necessitará de apoio/reforço;"
   }
  ]
 },
 {
  "codigo": "4.33",
  "descricao": "Posse de arma branca",
  "macro": "g",
  "categoria": "urgencia",
  "gravidade": "urgencia",
  "bo": "escola",
  "definicao": "Arma branca é qualquer objeto cortante ou perfurante, como facas, canivetes, estiletes, punhais, martelos, machadinhas ou similares, que possa ser utilizado para causar lesão corporal ou ameaça. A posse ou porte de arma branca dentro do ambiente escolar é proibida e configura risco à integridade física da comunidade escolar.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher os envolvidos, com ação imediata de contenção, removendo o objeto de forma segura, evitando que seja utilizado em potenciais confrontos.",
    "d": [
     "Ouvir o estudante de forma protegida, sem exposição ou constrangimento;",
     "Compreender, por meio da escuta ativa, as motivações para o uso/posse do objeto pelo estudante."
    ]
   },
   {
    "k": "b",
    "t": "Em caso de situação emergencial, acionar o Botão do Pânico ou a Polícia Militar pelo telefone 190."
   },
   {
    "k": "c",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável).",
     "Orientar (formalmente / documentar) a família e/ou responsáveis pelos envolvidos sobre o registro de Boletim de Ocorrência, de acordo com a gravidade do fato;",
     "Em caso de constatação de utilização do objeto para ameaça ou intimidação, comparecer um representante da equipe gestora no Distrito Policial para registrar o B.O.;",
     "Providenciar a entrega do objeto perigoso à polícia, não armazenar o objeto na unidade escolar."
    ]
   },
   {
    "k": "d",
    "t": "Comunicar o Conselho Tutelar para, em parceria com a unidade escolar, acompanhar e monitorar o caso."
   },
   {
    "k": "e",
    "t": "Informar a Unidade Regional de Ensino – Supervisor da Unidade Escolar"
   },
   {
    "k": "f",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/combinadas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar o chamado."
    ]
   },
   {
    "k": "g",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "h",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática da violência ou temas similares.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos."
    ]
   },
   {
    "k": "i",
    "t": "Consultar o “Plano de Contingência” e/ou documentos/protocolos de segurança similares, para verificar as ações de prevenção e segurança no ambiente escolar.",
    "d": [
     "Avaliar se as ações do Plano de Contingência vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos."
    ]
   },
   {
    "k": "j",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da discriminação."
   },
   {
    "k": "k",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando parceria e diálogo para continuidade das tratativas de acolhimento, quando se fizer necessário, em ações integradas que promovam o acesso, atendimento e acompanhamento dos indivíduos, conforme o contexto."
   }
  ]
 },
 {
  "codigo": "4.34",
  "descricao": "Posse de arma de brinquedo",
  "macro": "g",
  "categoria": "grave",
  "gravidade": "media",
  "bo": "avaliar",
  "definicao": "Arma de brinquedo é qualquer objeto que reproduza, de forma visual ou funcional, a aparência de uma arma. Apesar da aparência semelhante às armas reais, armas de brinquedo não são consideradas armas de fogo e não configuram os mesmos delitos previstos no Estatuto do Desarmamento. No entanto, seu uso pode gerar percepção de ameaça, pânico coletivo ou ser utilizado para intimidação, especialmente em ambientes escolares.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher os envolvidos, com ação imediata de contenção, removendo o objeto de forma segura, evitando que seja utilizado em potenciais confrontos.",
    "d": [
     "Ouvir o estudante de forma protegida, sem exposição ou constrangimento;",
     "Compreender, por meio da escuta ativa, as motivações para o uso/posse do objeto pelo estudante."
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável).",
     "Orientar (formalmente / documentar) a família e/ou responsáveis pelos envolvidos sobre o registro de Boletim de Ocorrência, de acordo com a gravidade do fato e, principalmente, em caso de constatação de utilização do objeto para ameaça ou intimidação;"
    ]
   },
   {
    "k": "c",
    "t": "Informar a Unidade Regional de Ensino – Supervisor da Unidade Escolar."
   },
   {
    "k": "d",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/combinadas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar o chamado."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática da violência ou temas similares.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos."
    ]
   },
   {
    "k": "f",
    "t": "Consultar o “Plano de Contingência” e/ou documentos/protocolos de segurança similares, para verificar as ações de prevenção e segurança no ambiente escolar.",
    "d": [
     "Avaliar se as ações do Plano de Contingência vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos."
    ]
   }
  ]
 },
 {
  "codigo": "4.35",
  "descricao": "Posse de arma de fogo / simulacro",
  "macro": "g",
  "categoria": "urgencia",
  "gravidade": "urgencia",
  "bo": "escola",
  "definicao": "Arma de fogo é qualquer dispositivo capaz de disparar projéteis com pólvora ou explosivo, como revólveres, pistolas, espingardas ou similares. A posse, porte ou circulação de arma de fogo em ambiente escolar é ilegal e representa risco extremo à integridade física de estudantes, profissionais e visitantes. Já o simulacro é um objeto que, visualmente, pode ser confundido com uma arma de fogo, mas que não possui aptidão para a realização de tiro de qualquer natureza. Todavia, foi elaborado com o propósito de ser fiel à imagem de uma arma de fogo, causando assim, intimidação e ameaça em seu uso o",
  "passos": [
   {
    "k": "a",
    "t": "Acionar o Botão do Pânico ou ligar 190 – Polícia Militar."
   },
   {
    "k": "b",
    "t": "Em caso de emergência, acionar protocolos de segurança, contingência ou similares para garantir que estudantes e profissionais estejam em local seguro, orientados e protegidos."
   },
   {
    "k": "c",
    "t": "Comunicar os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres de cada um.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável);",
     "Orientar (formalmente / documentar) a família e/ou responsáveis pelos envolvidos sobre o registro de Boletim de Ocorrência, principalmente se envolver vítima de ameaça/intimidação."
    ]
   },
   {
    "k": "d",
    "t": "Registrar o Boletim de Ocorrência – representante da equipe gestora."
   },
   {
    "k": "e",
    "t": "Informar a Unidade Regional de Ensino – Supervisor da Unidade Escolar."
   },
   {
    "k": "f",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/combinadas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar o chamado."
    ]
   },
   {
    "k": "g",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática da violência ou temas similares.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos."
    ]
   },
   {
    "k": "h",
    "t": "Consultar o “Plano de Contingência” e/ou documentos/protocolos de segurança similares, para verificar as ações de prevenção e segurança no ambiente escolar.",
    "d": [
     "Avaliar se as ações do Plano de Contingência vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos."
    ]
   },
   {
    "k": "i",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da discriminação."
   },
   {
    "k": "j",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando parceria e diálogo para continuidade das tratativas de acolhimento, quando se fizer necessário, em ações integradas que promovam o acesso, atendimento e acompanhamento dos indivíduos, conforme o contexto."
   },
   {
    "k": "k",
    "t": "Aplicar os mesmos procedimentos em situações que envolvam objetos perigosos.26"
   }
  ]
 },
 {
  "codigo": "4.36",
  "descricao": "Racismo",
  "macro": "b",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "Racismo pode ser definido como um sistema de crenças, práticas e estruturas sociais que hierarquiza pessoas e grupos com base em características físicas ou culturais, especialmente a cor da pele, estabelecendo relações de poder que resultam em desigualdade, discriminação e exclusão. Na prática individual, se manifesta com atitudes, falas, comportamentos preconceituosos ou outras formas e manifestações de violência que buscam inferiorizar a vítima com base em suas características.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher a vítima de racismo e providenciar a mediação da situação de conflito, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso. Não relativize a situação não promova revitimização.",
    "d": [
     "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento;",
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima);",
     "Em ambos os casos, articular o acesso aos serviços da RAPS (Rede de"
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável).",
     "Se constatada omissão familiar no acompanhamento do estudante, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família.",
     "Orientar (formalmente / documentar) a família e/ou responsáveis pelos envolvidos sobre o registro de Boletim de Ocorrência, acompanhando até a delegacia, quando necessário."
    ]
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/combinadas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar o chamado."
    ]
   },
   {
    "k": "d",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática “Educação Antirracista”.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares, principalmente em caso de recorrência do tema entre os registros realizados na Plataforma Conviva e construir estratégias de monitoramento e prevenção para que a situação não se repita."
    ]
   },
   {
    "k": "f",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes.",
    "d": [
     "Conscientizar a comunidade escolar sobre a Lei nº 7.716/1987;",
     "Promover ações que incorporem vivências de letramento racial;",
     "Dialogar sobre as práticas de uma educação antirracista."
    ]
   },
   {
    "k": "g",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da discriminação."
   },
   {
    "k": "h",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando parceria e diálogo para continuidade das tratativas de acolhimento, quando se fizer necessário, em ações integradas que promovam o acesso, atendimento e acompanhamento dos indivíduos, conforme o contexto."
   }
  ]
 },
 {
  "codigo": "4.37",
  "descricao": "Roubo",
  "macro": "e",
  "categoria": "urgencia",
  "gravidade": "urgencia",
  "bo": "escola",
  "definicao": "",
  "passos": [
   {
    "k": "a",
    "t": "Constatada uma situação de roubo envolvendo ameaça ou violência, solicitar apoio imediato das forças de segurança, por meio do número 190 e/ou botão do pânico, quando o caso estiver em curso na unidade escolar."
   },
   {
    "k": "b",
    "t": "A escola deve agir com cautela, preservando a integridade física e emocional de todos os envolvidos."
   },
   {
    "k": "c",
    "t": "Acolher a vítima (quando houver)27 e providenciar a mediação da situação de conflito, realizando a escuta ativa e qualificada.",
    "d": [
     "Garantir a segurança física e emocional das pessoas envolvidas, afastando o autor da situação de conflito e acolhendo a vítima",
     "O diálogo e a mediação podem ser aplicados em casos de conflitos interpretativos (ex.: objeto emprestado e não devolvido, acusações infundadas);",
     "Em situações de suspeita, é essencial realizar escuta atenta e não promover constrangimento público do estudante e potenciais envolvidos."
    ]
   },
   {
    "k": "d",
    "t": "Em situações de roubo caracterizado (com ameaça ou violência), não cabe mediação interna",
    "d": [
     "A escola deve priorizar a proteção da vítima, acionar imediatamente os responsáveis legais pelos envolvidos e comunicar os órgãos competentes28."
    ]
   },
   {
    "k": "e",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável);",
     "Orientar às famílias quanto ao registro de Boletim de Ocorrência e acompanhar os responsáveis, quando necessário."
    ]
   },
   {
    "k": "f",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação.",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma."
    ]
   },
   {
    "k": "g",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário."
   },
   {
    "k": "h",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da ação.",
    "d": [
     "Polícia Militar Escolar (via Ronda Escolar) / Polícia Civil para apuração formal.",
     "DPCA (Delegacia de Proteção à Criança e ao Adolescente) ou DECA (Delegacia da",
     "Conselho Tutelar – em situações em envolvam menores de 18 anos.",
     "CREAS – quando houver reincidência ou necessidade de acompanhamento",
     "Ministério Público e Vara da Infância e da Juventude – em casos mais graves ou"
    ]
   }
  ]
 },
 {
  "codigo": "4.38",
  "descricao": "Sequestro",
  "macro": "b",
  "categoria": "urgencia",
  "gravidade": "urgencia",
  "bo": "escola",
  "definicao": "Sequestro é definido como o ato de privar alguém de sua liberdade, impedindo que a pessoa se locomova livremente, mediante violência, grave ameaça ou qualquer outro meio coercitivo.",
  "passos": [
   {
    "k": "a",
    "t": "Verificar se a família da vítima já acionou a Polícia Militar via 190."
   },
   {
    "k": "b",
    "t": "Em caso de criança ou adolescente, verificar se o Conselho Tutelar foi comunicado pela família e/ou responsável legal, se não, formalizar a informação."
   },
   {
    "k": "c",
    "t": "Orientar a família sobre o Registro de Boletim de Ocorrência."
   },
   {
    "k": "d",
    "t": "Comunicar o ocorrido em grupo de PSVE (ou equivalente) para promoção de busca."
   },
   {
    "k": "e",
    "t": "Informar a equipe regional (URE)."
   },
   {
    "k": "f",
    "t": "Registrar o episódio na Plataforma Conviva."
   },
   {
    "k": "g",
    "t": "Se ato cometido dentro – os nas imediações – da unidade escolar, verificar junto à equipe regional (URE) em consonância com a equipe central (SEDUC/SP) quanto aos desdobramentos e orientações complementares."
   },
   {
    "k": "h",
    "t": "Verificar se as recomendações de segurança desse presente documento foram seguidas corretamente."
   },
   {
    "k": "i",
    "t": "Verificar o Plano de Contingência da unidade escolar contempla ações para invasões externas."
   },
   {
    "k": "j",
    "t": "Analisar se as estratégias e ações previstas e estabelecidas em documento foram atendidas em conformidade com o proposto"
   },
   {
    "k": "k",
    "t": "Avaliar a necessidade de ajustes e revisão dos atos planejados."
   },
   {
    "k": "l",
    "t": "Se ato cometido fora da unidade escolar, idem ao item anterior, atentando-se também às orientações da SSP.",
    "d": [
     "Sequestro simples: Sem intenção de obter vantagem financeira.",
     "Sequestro qualificado: exigência de resgate, participação de grupo criminoso ou violência contra a vítima.",
     "Extorsão mediante sequestro: (Quando há exigência de resgate ou vantagem econômica.",
     "Cárcere privado: Quando a vítima é mantida em local fechado.",
     "Sequestro de menores: crianças ou adolescentes, com agravamento da pena.",
     "Sequestro relâmpago: Privação temporária da liberdade com objetivo de realizar saques ou transferências bancárias."
    ]
   }
  ]
 },
 {
  "codigo": "4.39",
  "descricao": "Sinais de alterações emocionais (irritabilidade, agressividade, ansiedade, pânico etc.)",
  "macro": "f",
  "categoria": "grave",
  "gravidade": "media",
  "bo": "nao",
  "definicao": "Sinais de alterações emocionais são manifestações comportamentais, cognitivas ou fisiológicas que indicam instabilidade emocional ou sofrimento psicológico.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher a pessoa em crise e direcioná-la a um espaço reservado, quando possível, para evitar uma situação de exposição com potencial vexatório.",
    "d": [
     "A escuta ativa e acolhimento ético devem ser promovidos por meio de espaços seguros de escuta, sem julgamento, respeitando a singularidade do estudante e promovendo vínculo de confiança;",
     "Monitorar frequência, intensidade e contexto das alterações emocionais;",
     "Analisar se a situação de crise do estudante reflete ou é justificada por outras situações do clima escolar que necessitem de mediações e acolhimento com outros envolvidos."
    ]
   },
   {
    "k": "b",
    "t": "Em situações que a equipe escolar necessite de apoio para intervenção, acionar os serviços de saúde (SAMU), comunicando as forças de segurança em situações que coloquem em risco a integridade física do estudante e/ou dos demais (190 ou ronda escolar), além do responsável legal que deve ser acionado imediatamente."
   },
   {
    "k": "c",
    "t": "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento.",
    "d": [
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima);",
     "Em ambos os casos, articular o acesso aos serviços da RAPS (Rede de"
    ]
   },
   {
    "k": "d",
    "t": "Dialogar com os responsáveis pelo estudante em situação de crise, dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Realizar reuniões de orientação e escuta com responsáveis, promovendo corresponsabilidade no cuidado;",
     "Não incentivar punições imediatas ou exposição pública, que podem agravar o sofrimento emocional;",
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável)."
    ]
   },
   {
    "k": "e",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação.",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma."
    ]
   },
   {
    "k": "f",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática “Saúde Mental / Emocional”.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares, principalmente em caso de recorrência do tema entre os registros realizados na Plataforma Conviva e construir estratégias de monitoramento e prevenção para que a situação não se repita;",
     "Implementar ações temáticas sobre saúde mental, diversidade, convivência e bem-estar;",
     "Envolver professores, coordenadores, gestores e funcionários na construção de estratégias de apoio e prevenção;",
     "Construir estratégias de manejo para prevenção e enfrentamento de situações recorrentes;",
     "Orientar estudantes e comunidade escolar sobre estratégias de autorregulação e convivência, articulando ações com a participação do Grêmio Estudantil",
     "Facilitar espaços seguros de diálogo e escuta entre estudantes, promovendo cuidado coletivo."
    ]
   },
   {
    "k": "g",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando parceria e",
    "d": [
     "Equipe escolar (psicólogos, orientadores e docentes) – acompanhamento e",
     "CREAS/CRAS – em casos com fatores sociais associados (violência,",
     "Conselho Tutelar – quando houver risco ao estudante, negligência ou violência",
     "Serviços de saúde (UBS, CAPS, atenção psicossocial) – atendimento o UBS – Avaliação inicial; o CAPS – acompanhamento especializado, se necessário.",
     "Agressividade incomum;",
     "Ansiedade, tensão ou preocupação excessiva;",
     "Crises de pânico, medo intenso ou retraimento social;",
     "Irritabilidade ou explosões de raiva;",
     "Mudanças abruptas de humor ou comportamento."
    ]
   }
  ]
 },
 {
  "codigo": "4.40",
  "descricao": "Sinais de automutilação",
  "macro": "f",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "nao",
  "definicao": "",
  "passos": [
   {
    "k": "a",
    "t": "Identificar sinais de automutilação com empatia, evitando julgamento ou constrangimento.",
    "d": [
     "Oferecer espaço seguro para a vítima falar sobre suas emoções e dificuldades;",
     "A escuta ativa e acolhimento ético devem ser promovidos sem julgamento, respeitando a singularidade do estudante e promovendo vínculo de confiança;",
     "Identificar e recolher os objetos perfurocortantes29, apresentando-os aos responsáveis legais, recomendando o descarte oficial – lembrando que objetos perfurocortantes podem trazer risco de contaminação, por esse motivo, é necessário que os profissionais tenham cautela ao manusear. Recomendamos solicitar ao próprio estudante depositar os objetos em um recipiente seguro para evitar potenciais contaminações;",
     "Monitorar frequência, intensidade e contexto das alterações emocionais;",
     "Articular com pessoas próximas ao estudante quanto a observação, a posse e o acesso à materiais cortantes que possam ser utilizados pela vítima para automutilação;",
     "Analisar se a situação de crise do estudante reflete ou é justificada por outras situações do clima escolar que necessitem de mediações e acolhimento com outros envolvidos;",
     "Observar se existem relações do estudante com grupos de automutilação e utilização de imagens em rede social, por exemplo, que motivem ou estimulem essa prática;"
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelo estudante em situação de crise, dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Realizar reuniões de orientação e escuta com responsáveis, promovendo corresponsabilidade no cuidado;",
     "Não incentivar punições imediatas ou exposição pública, que podem agravar o sofrimento emocional;",
     "Orientar quanto a necessidade de acompanhamento psicossocial com avaliação inicial da UBS e/ou acompanhamento especializado do CAPS;",
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável).",
     "Comunicar imediatamente o Conselho Tutelar, articulando auxílio e acompanhamento junto aos serviços de saúde e atendimento psicossocial, como CAPS."
    ]
   },
   {
    "k": "c",
    "t": "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento.",
    "d": [
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima);"
    ]
   },
   {
    "k": "d",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação.",
     "Documentar sinais observados, contexto e medidas tomadas;",
     "Apontar as ações de mediação e acolhimento previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática “Saúde Mental / Emocional”.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares, principalmente em caso de recorrência do tema entre os registros realizados na Plataforma Conviva e construir estratégias de monitoramento e prevenção para que a situação não se repita;",
     "Implementar ações temáticas sobre saúde mental, diversidade, convivência e bem-estar;",
     "Ações pedagógicas preventivas com projetos de educação socioemocional, gestão de estresse, habilidades de enfrentamento e promoção de bem-estar;",
     "Envolver professores, coordenadores, gestores e funcionários na construção de estratégias de apoio, prevenção, observação e acompanhamento;",
     "Orientar estudantes e comunidade escolar sobre estratégias de autorregulação e convivência, articulando ações com a participação do Grêmio Estudantil;",
     "Ofertar espaços seguros de diálogo e escuta entre estudantes, promovendo cuidado coletivo.",
     "Cortes em braços, pernas ou outras partes do corpo;",
     "Queimaduras superficiais;",
     "Arranhões ou golpes repetidos em si mesmo",
     "Bater-se (dar socos em si mesmo ou contra paredes e objetos duros);",
     "Arrancar cabelos, sobrancelhas, cílios ou unhas de maneira compulsiva",
     "Impedir a cicatrização de feridas, mantendo-as abertas intencionalmente;",
     "Inserir objetos sob a pele ou causar ferimentos em regiões pouco visíveis (como coxas, abdômen ou braços, sob roupas longas).",
     "Equipe escolar (psicólogos, orientadores e docentes) – acompanhamento e registro de sinais;",
     "CREAS/CRAS – em casos com fatores sociais associados (violência, negligência etc.)",
     "Conselho Tutelar – em consonância com o previsto na Lei 15.231/2025",
     "Serviços de saúde (UBS, CAPS, atenção psicossocial) – atendimento especializado em casos de ansiedade, pânico ou sofrimento grave, por exemplo. o UBS – Avaliação inicial o CAPS – acompanhamento especializado, se necessário."
    ]
   }
  ]
 },
 {
  "codigo": "4.41",
  "descricao": "Sinais de isolamento social",
  "macro": "f",
  "categoria": "grave",
  "gravidade": "media",
  "bo": "nao",
  "definicao": "Isolamento social refere-se a comportamentos em que o estudante se afasta de interações com colegas, professores e atividades coletivas. Manifesta-se por: recusa em participar de atividades em grupo, afastamento durante intervalos, silêncio excessivo, ausência frequente de contato com colegas, entre outros.",
  "passos": [
   {
    "k": "a",
    "t": "Identificar sinais de isolamento social com empatia, evitando julgamento ou constrangimento a pessoa.",
    "d": [
     "Oferecer espaço seguro para a pessoa falar sobre suas emoções e dificuldades;",
     "A escuta ativa e acolhimento ético devem ser promovidos sem julgamento, respeitando a singularidade do estudante e promovendo vínculo de confiança;",
     "Monitorar mudanças abruptas de comportamento, observando quem passa a ficar mais quieto e isolado repentinamente e por período (duração) incomum;",
     "Analisar se a situação do estudante reflete ou é justificada por outras situações do clima escolar que necessitem de mediações e acolhimento com outros envolvidos."
    ]
   },
   {
    "k": "b",
    "t": "Articular com a família um acolhimento com o Psicólogo da Educação participando de ações em grupo, quando necessário.",
    "d": [
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima);",
     "Em ambos os casos, articular o acesso aos serviços da RAPS (Rede de"
    ]
   },
   {
    "k": "c",
    "t": "Dialogar com os responsáveis pelo estudante sobre o contexto observado a fim de compreender os diferentes contextos aos quais o estudante pode estar exposto.",
    "d": [
     "Realizar reuniões de orientação e escuta, promovendo corresponsabilidade no cuidado;",
     "Orientar sobre observações e estratégias de acolhimento, dentro e fora do ambiente escolar;",
     "Evitar rotular ou punir o estudante pelo comportamento isolado, de maneira que não se agrave a situação de potencial sofrimento emocional;",
     "Incentivar participação gradual em atividades coletivas, projetos de integração e trabalhos em grupo;",
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável)."
    ]
   },
   {
    "k": "d",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação.",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática “Saúde Mental / Emocional”.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Implementar ações temáticas sobre saúde mental, diversidade, convivência e bem-estar;",
     "Construir estratégias de manejo para prevenção e enfrentamento de situações recorrentes;",
     "Facilitar espaços seguros de diálogo e escuta entre estudantes, promovendo cuidado coletivo."
    ]
   },
   {
    "k": "f",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando parceria e diálogo para continuidade das tratativas de acolhimento, quando se fizer necessário, em ações integradas que promovam o acesso, atendimento e acompanhamento dos indivíduos, conforme o contexto.",
    "d": [
     "Equipe escolar (psicólogos, orientadores e docentes) – acompanhamento e",
     "CREAS/CRAS – em casos com fatores sociais associados (violência,",
     "Conselho Tutelar – quando houver risco ao estudante, negligência ou violência",
     "Serviços de saúde (UBS, CAPS, atenção psicossocial) – atendimento o UBS – Avaliação inicial; o CAPS – acompanhamento especializado, se necessário."
    ]
   }
  ]
 },
 {
  "codigo": "4.42",
  "descricao": "Situação de ameaça",
  "macro": "b",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "",
  "passos": [
   {
    "k": "a",
    "t": "Acolher os envolvidos e providenciar a mediação da situação de conflito, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso. Não relativize a situação."
   },
   {
    "k": "b",
    "t": "Agendar a atuação do Psicólogo da Educação para encontro com os grupos e foco no acolhimento, quando julgar necessário",
    "d": [
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando esses estiverem envolvidos.",
     "Em ambos os casos, articular o acesso aos serviços da RAPS (Rede de"
    ]
   },
   {
    "k": "c",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável);",
     "Se constatada omissão familiar no acompanhamento do estudante, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família."
    ]
   },
   {
    "k": "d",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/ combinadas no âmbito de ações pedagógicas e restaurativas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar e/ou concluir o chamado na plataforma."
    ]
   },
   {
    "k": "e",
    "t": "Solicitar a preservação das imagens captadas do episódio pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "f",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam as temáticas da Violência e da CNV – Comunicação Não Violenta",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Em caso de necessidade, planejar ações complementares, principalmente em caso de recorrência do tema entre os registros realizados na Plataforma Conviva."
    ]
   },
   {
    "k": "g",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da ameaça."
   },
   {
    "k": "h",
    "t": "Orientar (formalmente / documentar) a família e/ou responsáveis pelos envolvidos sobre o registro de Boletim de Ocorrência, acompanhando até a delegacia, quando necessário.",
    "d": [
     "Se a ameaça for contra a escola ou comunidade escolar, um representante da equipe gestora deverá realizar o registro de Boletim de Ocorrência.",
     "Se a ameaça apresentar risco iminente à integridade dos envolvidos, acionar a Ronda Escolar ou ligar para o 190."
    ]
   },
   {
    "k": "i",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando parceria e diálogo para continuidade das tratativas de acolhimento, quando se fizer necessário, em ações integradas que promovam o acesso, atendimento e acompanhamento dos indivíduos, conforme o contexto."
   }
  ]
 },
 {
  "codigo": "4.43",
  "descricao": "Suicídio concretizado",
  "macro": "f",
  "categoria": "urgencia",
  "gravidade": "urgencia",
  "bo": "avaliar",
  "definicao": "",
  "passos": [
   {
    "k": "a",
    "t": "Se ocorrido na unidade escolar, acionar imediatamente os serviços de emergência (SAMU – 192, Corpo de Bombeiros – 193, Polícia Militar – 190 ou Botão do Pânico).",
    "d": [
     "Isolar e preservar o local até a chegada dos policiais e demais serviços, para preservar os demais integrantes da comunidade escolar;",
     "Garantir sigilo das informações, evitando exposição ou comentários impróprios;",
     "Evitar especulações e discursos sensacionalistas ou moralizantes;",
     "Comunicar a Equipe Regional (URE) e o órgão central imediatamente, para ações de apoio e acolhimento da equipe escolar;"
    ]
   },
   {
    "k": "b",
    "t": "Agendar a atuação do Psicólogo da Educação para encontro com os grupos e foco no acolhimento.",
    "d": [
     "Aos servidores públicos, orientar sobre o acesso ao programa de apoio psicológico;",
     "Articular o acesso aos serviços da RAPS (Rede de Atenção Psicossocial) e demais órgãos do Sistema de Garantia de Direitos, para atendimento da comunidade escolar."
    ]
   },
   {
    "k": "c",
    "t": "A Equipe Conviva Regional, articulada com o órgão central, deverá promover ações de acolhimento da comunidade escolar.",
    "d": [
     "Auxiliar no planejamento de ações de apoio emocional e prevenção pós- ocorrência – “pós-venção”30 – para minimizar risco de outros casos;",
     "Oferecer apoio psicológico imediato para a equipe gestora, professores e funcionários que presenciaram ou foram impactados;",
     "Promover espaços seguros para expressão de sentimentos;",
     "Promover grupos de escuta para estudantes, familiares e profissionais;",
     "Apoiar professores na gestão de sala de aula e no acompanhamento de estudantes em luto;",
     "Esclarecer sinais de alerta para ideação suicida e como buscar ajuda."
    ]
   },
   {
    "k": "d",
    "t": "A Equipe Gestora deverá dialogar com a comunidade escolar, fornecendo informações claras e adequadas à cada faixa etária sobre o que ocorreu, evitando sensacionalismo ou detalhes prejudiciais.",
    "d": [
     "Evitar compartilhamento de detalhes sensíveis/sensacionalistas ou romantização do suicídio;",
     "Orientar, com apoio técnico de especialistas, estudantes, famílias e responsáveis, professores e demais funcionários sobre como falar sobre suicídio de forma segura;",
     "Realizar reuniões de orientação e escuta, promovendo corresponsabilidade no cuidado;",
     "Articular ações com a UBS de referência, assim como, os Centros de Atenção Psicossocial (CAPS) ou demais serviços de emergência, quando necessário."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática “Saúde Mental / Emocional”.",
    "d": [
     "Estabelecer ações complementares que promovam a conscientização sobre saúde mental;",
     "Criar espaços seguros de diálogo e escuta entre estudantes, promovendo cuidado coletivo;",
     "Orientar sobre observações e estratégias de acolhimento, dentro e fora do ambiente escolar;",
     "Incentivar expressão artística, esportiva e cultural como forma de acolhimento emocional."
    ]
   },
   {
    "k": "f",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato;",
     "Elencar as ações pedagógicas e restaurativas de acolhimento."
    ]
   },
   {
    "k": "g",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva, buscando parceria e diálogo para continuidade das tratativas de acolhimento, quando se fizer necessário, em ações integradas que promovam o acesso, atendimento e acompanhamento dos indivíduos, conforme o contexto.",
    "d": [
     "SAMU / Bombeiros / Polícia Militar – atendimento emergencial;",
     "Polícia Civil / Delegacia de Polícia – registro de B.O. e investigação;",
     "U.R.E./SEDUC – suporte técnico à comunidade escolar e orientações de comunicação institucional;",
     "CREAS / CRAS – apoio psicossocial às famílias e acompanhamento após o episódio;",
     "Serviços de Saúde Mental (CAPS, UBS) – suporte psicológico à comunidade escolar (pós-venção);",
     "Conselho Tutelar – se houver outros estudantes menores envolvidos ou em risco.",
     "Apoio psicológico a familiares e colegas após um suicídio ou morte de um estudante;",
     "Programas de acompanhamento emocional para vítimas de violência escolar;",
     "Ações de suporte para profissionais que testemunharam um incidente grave na escola."
    ]
   }
  ]
 },
 {
  "codigo": "4.44",
  "descricao": "Tentativa de suicídio",
  "macro": "f",
  "categoria": "urgencia",
  "gravidade": "urgencia",
  "bo": "nao",
  "definicao": "Tentativa de suicídio é um ato autoinfligido com intenção de provocar a própria morte, que não resulta no óbito. Pode envolver diversos métodos (ingestão de substâncias tóxicas, cortes profundos, enforcamento interrompido etc.). É considerada um grave sinal de sofrimento emocional e risco de suicídio consumado, sendo uma condição complexa de saúde mental e sofrimento psíquico, que frequentemente requer encaminhamento aos serviços da rede psicossocial para avaliação da gravidade do quadro.",
  "passos": [
   {
    "k": "a",
    "t": "Se ocorrido na unidade escolar, acionar imediatamente os serviços de emergência SAMU – 192 ou Corpo de Bombeiros – 193.",
    "d": [
     "Prestar primeiros socorros conforme orientações dos serviços de emergência, sem improvisações arriscadas.",
     "Acolher e preservar a vítima em ambiente reservado até a chegada do socorro, evitando a exposição da vítima."
    ]
   },
   {
    "k": "b",
    "t": "Após o atendimento de urgência, comunicar a família ou responsáveis legais da vítima.",
    "d": [
     "Garantir sigilo das informações, evitar especulações e comentários impróprios, sensacionalistas, moralizantes ou acusatórios;",
     "Identificar e recolher potenciais objetos utilizados na tentativa – lembrando que objetos perfurocortantes31 podem trazer risco de contaminação;",
     "Orientar quanto a necessidade de atendimento psicológico ou psiquiátrico urgente;",
     "Comunicar imediatamente o Conselho Tutelar, articulando auxílio e acompanhamento junto aos serviços de saúde e atendimento psicossocial, como CAPS"
    ]
   },
   {
    "k": "c",
    "t": "Comunicar a Equipe Regional (URE), para ações de apoio e acolhimento da equipe escolar.",
    "d": [
     "Agendar a atuação do Psicólogo da Educação com foco no acolhimento;",
     "Planejar ações de pós-crise para acolher colegas, professores e funcionários impactados;",
     "Analisar se a situação de crise do estudante reflete ou é justificada por outras situações do clima escolar que necessitem de mediações e acolhimento com outros envolvidos;",
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de sofrimento);",
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável)."
    ]
   },
   {
    "k": "d",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação / socorro;",
     "Encartar evidências dos encaminhamentos antes de encerrar o chamado."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática “Saúde Mental / Emocional”.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Construir estratégias de monitoramento e prevenção para que a situação não se repita;",
     "Envolver professores, coordenadores, gestores e funcionários na construção de estratégias de apoio, prevenção, observação e acompanhamento;",
     "Implementar ações temáticas sobre saúde mental, diversidade, convivência e bem-estar;",
     "Ações pedagógicas preventivas com projetos de educação socioemocional, gestão de estresse, habilidades de enfrentamento e promoção de bem-estar;",
     "Ofertar espaços seguros de diálogo e escuta entre estudantes, promovendo cuidado coletivo."
    ]
   },
   {
    "k": "f",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva, buscando parceria e diálogo para continuidade das tratativas de acolhimento.",
    "d": [
     "Equipe escolar (psicólogos, orientadores e docentes) – acompanhamento, observação de sinais e fortalecimento da escola como espaço de proteção;",
     "CREAS/CRAS – em casos com fatores sociais associados (violência, negligência etc.);",
     "Conselho Tutelar – em consonância com o previsto na Lei 15.231/2025;",
     "Serviços de saúde (UBS, CAPS, atenção psicossocial) – acompanhamento imediato da vítima. Fatores de risco x Fatores de proteção",
     "Ambiente escolar violento;",
     "Fragilidade no sentimento de pertencimento;",
     "Falta de vínculo afetivo com a equipe escolar;",
     "Baixo suporte familiar;",
     "Sinais físicos (lesões, cicatrizes);",
     "Sinais comportamentais (isolamento, mudanças de humor, uso de roupas que escondem o corpo).",
     "Habilidades socioemocionais desenvolvidas (comunicação, empatia, resolução de problemas);",
     "Projeto de vida e perspectivas de futuro;",
     "Presença de adultos de confiança que escutam e orientam;",
     "Clima escolar positivo, com práticas de convivência e respeito à diversidade;",
     "Espaços de escuta e apoio emocional."
    ]
   }
  ]
 },
 {
  "codigo": "4.45",
  "descricao": "Transfobia",
  "macro": "b",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "Transfobia é a prática de rejeição, preconceito ou violência contra pessoas que não se identificam com o gênero que lhes foi atribuído ao nascer. Também definida como definida como qualquer forma de discriminação, violência, exclusão ou humilhação dirigida a pessoas transgênero ou travestis, em razão de sua identidade de gênero. No ambiente escolar, isso pode se manifestar por meio de: negação do nome social; comentários ofensivos ou debochados sobre a identidade de gênero; exclusão de atividades escolares ou utilização de espaços de uso coletivo; cyberbullying com conteúdo transfóbico; violên",
  "passos": [
   {
    "k": "a",
    "t": "Acolher a vítima de transfobia imediatamente, com escuta qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso. Não relativize!",
    "d": [
     "Respeitar a identidade de gênero da vítima sob essas circunstâncias é essencial para a condução assertiva do acolhimento e da mediação. Não promova revitimização!",
     "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento;",
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima);",
     "Em ambos os casos, articular o acesso aos serviços da RAPS (Rede de",
     "Orientar (formalmente / documentar) a família e/ou responsáveis pelos envolvidos sobre o registro de Boletim de Ocorrência, acompanhando até a delegacia, quando necessário.",
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável);",
     "Se constatada omissão familiar ou violação de direitos da criança/adolescente por parte da família e/ou dos responsáveis, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família para promover a garantia de direitos da criança/adolescente."
    ]
   },
   {
    "k": "b",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/combinadas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar o chamado."
    ]
   },
   {
    "k": "c",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar outras evidências como mensagens, prints, áudios, entre outros."
    ]
   },
   {
    "k": "d",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática “Preconceitos / Transfobia / Igualdade de Gênero”.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares, principalmente em caso de recorrência do tema entre os registros realizados na Plataforma Conviva e construir estratégias de monitoramento para prevenir situações similares;",
     "Planejar ação formativa junto à equipe escolar (docentes, equipe gestora, AOEs e demais prestadores de serviços – contratados e/ou terceirizados) sobre o respeito à identidade de gênero – sem expor a vítima e/ou caso;",
     "Documentar evidências das ações formativas com a equipe escolar;",
     "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes;",
     "Elaborar ações que promovam o respeito à diversidade sexual."
    ]
   },
   {
    "k": "e",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da discriminação."
   },
   {
    "k": "f",
    "t": "Encaminhamentos complementares – Articular com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando parceria e diálogo para continuidade das tratativas de acolhimento, quando se fizer necessário, em ações integradas que promovam o acesso, atendimento e acompanhamento dos indivíduos, conforme o contexto."
   }
  ]
 },
 {
  "codigo": "4.46",
  "descricao": "Uso inadequado de dispositivos eletrônicos",
  "macro": "h",
  "categoria": "administrativa",
  "gravidade": "leve",
  "bo": "nao",
  "definicao": "O uso indevido de dispositivos eletrônicos (como o celular) em sala de aula ocorre quando o estudante utiliza o aparelho de forma inadequada ou em desacordo com as orientações da equipe escolar, comprometendo o andamento das atividades pedagógicas, a atenção coletiva ou os direitos de imagem e privacidade de colegas e servidores.",
  "passos": [
   {
    "k": "a",
    "t": "Providenciar a mediação do conflito junto aos envolvidos, pautando-se na orientação e conscientização sobre o uso indevido do recurso eletrônico.",
    "d": [
     "O professor deve intervir de forma educativa, orientando sobre o uso responsável, conforme as normas internas da escola (sem retenção definitiva do aparelho);",
     "O estudante deve ser orientado individualmente sobre a conduta inadequada e os impactos de seu comportamento no coletivo;",
     "Em casos de reincidência, deve ser comunicada a equipe gestora para registro e acompanhamento."
    ]
   },
   {
    "k": "b",
    "t": "Quando houver caso de reincidência nessa prática:",
    "d": [
     "Envolver a família ou responsável legal, preferencialmente mediante reunião presencial, para corresponsabilização e diálogo formativo;",
     "Compreender as causas do uso, evitando punições automáticas;",
     "Orientar sobre respeito, empatia e convivência democrática;",
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável);",
     "Registrar o episódio na Plataforma Conviva, encartando as evidências de mediação antes de encerrar o chamado."
    ]
   },
   {
    "k": "c",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que abordam a temática.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares, principalmente em caso de recorrência do tema entre os registros realizados na Plataforma Conviva e construir estratégias de monitoramento para prevenir situações similares;",
     "Promover ações de conscientização sobre uso ético e responsável das tecnologias digitais;",
     "Incluir o tema em projetos interdisciplinares que abordem cidadania digital, segurança online e respeito às diferenças;",
     "Utilizar o apoio do Programa Psicólogos nas Escolas em casos que envolvam sofrimento emocional, vergonha, humilhação ou exposição pública."
    ]
   },
   {
    "k": "d",
    "t": "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes.",
    "d": [
     "O diálogo sobre ética digital e limites da liberdade de expressão;",
     "A corresponsabilidade entre escola, estudantes e famílias."
    ]
   }
  ]
 },
 {
  "codigo": "4.47",
  "descricao": "Violência de gênero contra meninas e mulheres",
  "macro": "b",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "Violência de gênero é toda forma de discriminação, exclusão ou agressão dirigida a uma pessoa em razão de seu gênero, identidade ou expressão de gênero. No ambiente escolar, ela se manifesta em situações que desvalorizam, humilham ou limitam meninas e mulheres, ou qualquer estudante cuja identidade de gênero fuja ao padrão hegemônico. Esse tipo de violência se evidencia em conflitos interpessoais que colocam um gênero em posição de inferioridade.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher a vítima – preferencialmente, por profissional mulher – e providenciar a mediação da situação de conflito, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso. Não relativize a situação.",
    "d": [
     "Preservar a vítima não a deixando com o agressor no mesmo espaço de mediação, garantindo proteção, sigilo e escuta empática;",
     "Quando houver indícios de crime ou infração grave (violência sexual, por exemplo), seguir as orientações da categoria adequada, conforme contexto observado pela equipe gestora;",
     "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento, quando necessário;",
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima);",
     "Em ambos os casos, articular o acesso aos serviços da RAPS (Rede de"
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável);",
     "Se constatada omissão familiar ou violação de direitos da criança/adolescente por parte da família e/ou dos responsáveis, cabe comunicar o Conselho Tutelar, solicitando apoio na articulação com a família para a garantia de direitos;",
     "Orientar (formalmente / documentar) a família e/ou responsáveis pelos envolvidos sobre o registro de Boletim de Ocorrência, acompanhando até a delegacia especializada, quando possível e necessário."
    ]
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/combinadas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar o chamado."
    ]
   },
   {
    "k": "d",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios.",
     "Violência física, sexual ou psicológica;",
     "Assédio ou abuso moral;",
     "Discriminação e humilhação;",
     "Intimidação ou coerção com base no gênero."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que contemplem essa temática.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos;",
     "Promover campanhas de conscientização sobre igualdade de gênero e combate à violência;",
     "Elaborar atividades educativas que reforcem respeito, empatia e cultura de proteção à vida e à integridade;",
     "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização;",
     "Apoiar a criação de espaços de escuta e acolhimento entre estudantes, fortalecendo redes de apoio entre pares;",
     "Incentivar denúncia responsável de situações de violência ou assédio à direção da escola."
    ]
   },
   {
    "k": "f",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da violência."
   },
   {
    "k": "g",
    "t": "Articular parcerias com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando diálogo para continuidade das tratativas de acolhimento – quando se fizer necessário – e em ações integradas que promovam a (in)formação, assim como, possibilitem o acesso e acompanhamento de pessoas em situação de sofrimento, caso necessário.",
    "d": [
     "Polícia Civil / Delegacia da Mulher – de acordo com o texto, sempre que se fizer necessário o registro de Boletim de Ocorrência, solicitando investigação e medidas legais;",
     "Conselho Tutelar – quando constatado crime ou ato infracional."
    ]
   }
  ]
 },
 {
  "codigo": "4.48",
  "descricao": "Violência doméstica / maus-tratos",
  "macro": "j",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "Maus tratos ou violência doméstica compreendem qualquer ação ou omissão que cause sofrimento físico, psicológico, moral ou sexual à criança, adolescente ou qualquer integrante do núcleo familiar, ocorrendo dentro ou fora do lar, de forma contínua ou pontual. Exemplos incluem: agressão física (bater, empurrar, queimar); abuso sexual ou exploração sexual; violência psicológica (ameaças, humilhações, isolamento); negligência (falta de cuidados básicos, alimentação, higiene ou acompanhamento escolar); exposição a situações de risco.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher a vítima em ambiente reservado, com escuta atenta e sem indução de respostas. É fundamental evitar a revitimização, limitando o relato ao necessário para compreender a situação.",
    "d": [
     "Quando houver indícios de crime ou infração grave (violência sexual, por exemplo), considerar também as orientações da categoria adequada, conforme contexto observado pela equipe gestora;",
     "Notificação à família: apenas se não houver risco à vítima;",
     "Caso haja suspeita de participação ou conivência de familiares, a escola deve acionar diretamente os órgãos competentes;",
     "Em se tratando de violência praticada por responsáveis legais, comunicar o Conselho Tutelar imediatamente, assim como, acionar a polícia militar:",
     "A escola tem obrigação legal de comunicar o Conselho Tutelar, conforme o Art. 13 do ECA, em todos os casos de suspeita ou confirmação de maus-tratos;",
     "Em situações de risco grave, comunicar também a Delegacia de Polícia (preferencialmente a Delegacia de Defesa da Mulher ou Delegacia de Proteção à Criança e ao Adolescente);",
     "Utilizar canais como o Disque 100 (violação de Direitos Humanos) e ligue 180 (Violência contra mulheres).",
     "Agendar a atuação do Psicólogo da Educação com foco no acolhimento;",
     "Articular o acesso aos serviços da RAPS (Rede de Atenção Psicossocial) e demais órgãos do Sistema de Garantia de Direitos, quando analisado que a vítima está em sofrimento."
    ]
   },
   {
    "k": "b",
    "t": "Reforçamos: se o agressor for um integrante do núcleo familiar, não se deve acionar ou comunicar à família, para preservação da vítima, evitando exposição direta à novas situações de risco."
   },
   {
    "k": "c",
    "t": "Comunicar o CRAS e/ou CREAS para acompanhamento da situação, quando esses serviços estiverem disponíveis no território onde a escola ou a família estão inseridas."
   },
   {
    "k": "d",
    "t": "A mediação interna é restrita a orientações educativas e prevenção, nunca para apuração ou julgamento da situação."
   },
   {
    "k": "e",
    "t": "Um representante da equipe gestora deverá realizar o registro do Boletim de Ocorrência, preferencialmente, acompanhado da pessoa que acolheu a denúncia inicial."
   },
   {
    "k": "f",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de acolhimento e proteção previstas/planejadas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar o chamado."
    ]
   },
   {
    "k": "g",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que contemplem essa temática.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos;",
     "Promover campanhas de conscientização, observação e sensibilização quanto a temática da violência no ambiente familiar;",
     "Apoiar a criação de espaços de escuta e acolhimento entre estudantes, fortalecendo redes de apoio entre pares;",
     "Incentivar denúncia responsável de situações de violência ou assédio à direção da escola."
    ]
   },
   {
    "k": "h",
    "t": "Articular parcerias com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando diálogo para continuidade das tratativas de acolhimento – quando se fizer necessário – e em ações integradas que promovam a (in)formação, assim como, possibilitem o acesso e acompanhamento de pessoas em situação de sofrimento, sempre que necessário.",
    "d": [
     "Conselho Tutelar – primeira instância de proteção e acompanhamento do caso;",
     "Delegacia de Polícia (Especializada em Defesa da Criança e do Adolescente ou Mulher, se aplicável) – investigação e responsabilização criminal;",
     "CREAS/CRAS – acompanhamento psicossocial e suporte às famílias em situação de vulnerabilidade;",
     "Ministério Público – acompanhamento judicial e proteção integral dos direitos da vítima;",
     "UBS – atendimento médico e psicológico emergencial ou continuado. O que não fazer: condutas vedadas ou prejudiciais",
     "Não confrontar ou interrogar a criança/adolescente – Evite perguntas sugestivas ou",
     "Não omitir a denúncia – A omissão é infração administrativa conforme o ECA. O",
     "Não comunicar diretamente aos responsáveis suspeitos – Isso pode colocar a vítima",
     "Não expor a situação publicamente – Proteja a identidade da vítima. Evite comentários",
     "Não agir sozinho – Toda ação deve ser articulada com a equipe gestora e os serviços"
    ]
   }
  ]
 },
 {
  "codigo": "4.49",
  "descricao": "Vulnerabilidade familiar / cuidados parentais",
  "macro": "j",
  "categoria": "grave",
  "gravidade": "media",
  "bo": "nao",
  "definicao": "Vulnerabilidade familiar refere-se a situações em que crianças ou adolescentes não recebem cuidados adequados, proteção ou suporte familiar, podendo estar expostos a riscos. Inclui situações em que pais ou responsáveis apresentam limitações físicas, psicológicas ou socioeconômicas que comprometem os cuidados essenciais aos filhos.",
  "passos": [
   {
    "k": "a",
    "t": "Observar sinais indiretos, tais como: excesso de faltas, dificuldades de aprendizagem, higiene precária, relatos espontâneos de fome ou ausência de supervisão."
   },
   {
    "k": "b",
    "t": "Evitar julgamentos – compreender que a vulnerabilidade decorre de fatores estruturais (pobreza, desemprego, baixa escolaridade, ausência de rede de apoio) e não de falhas morais."
   },
   {
    "k": "c",
    "t": "Acolher a vítima ofertando escuta ativa, sigilosa e oferecendo apoio pedagógico."
   },
   {
    "k": "d",
    "t": "Agendar a atuação do Psicólogo da Educação com foco no acolhimento."
   },
   {
    "k": "e",
    "t": "Dialogar com a família ou responsáveis legais com orientações sobre cuidados, direitos e deveres parentais, buscando parceria na proteção da criança/adolescente.",
    "d": [
     "Não exponha a vítima e a família em reuniões ou espaços públicos;",
     "Não estigmatize a família ou tente responsabilizá-la isoladamente pela situação;",
     "Não tente substituir o papel dos serviços especializados (como assistência social ou saúde, por exemplo)."
    ]
   },
   {
    "k": "f",
    "t": "Articular junto ao CRAS e/ou CREAS o acompanhamento da situação - ou Conselho Tutelar, na ausência dos demais no território em que a unidade escolar está inserida."
   },
   {
    "k": "g",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de acolhimento e proteção previstas/planejadas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar o chamado. Principais dimensões da vulnerabilidade familiar alimentar. proteção efetivas. supervisão adequada."
    ]
   },
   {
    "k": "h",
    "t": "Articular parcerias com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando diálogo para continuidade das tratativas de acolhimento – quando se fizer necessário – e em ações integradas que promovam a (in)formação, assim como, possibilitem o acesso e acompanhamento de pessoas em situação de sofrimento, sempre que necessário.",
    "d": [
     "Conselho Tutelar – acionamento obrigatório quando houver risco ou suspeita de negligência ou maus-tratos;",
     "CREAS / CRAS – apoio psicossocial e acompanhamento familiar;",
     "Serviços de saúde (UBS, CAPS) – atendimento de suporte à saúde física e mental."
    ]
   }
  ]
 },
 {
  "codigo": "4.50",
  "descricao": "Xenofobia",
  "macro": "b",
  "categoria": "grave",
  "gravidade": "grave",
  "bo": "avaliar",
  "definicao": "Xenofobia é a aversão, discriminação ou hostilidade direcionada a pessoas de outros países, culturas ou origens étnicas diferentes, resultando em exclusão, humilhação, preconceito ou violência. No ambiente escolar, manifesta-se como: piadas, comentários ou insultos sobre origem, nacionalidade ou cultura; exclusão de atividades ou grupos por motivo de nacionalidade; agressões físicas ou verbais motivadas por preconceito cultural ou étnico.",
  "passos": [
   {
    "k": "a",
    "t": "Acolher a vítima e providenciar a mediação da situação de conflito, realizando a escuta ativa, qualificada, sem julgamentos prévios, garantindo um ambiente seguro e respeitoso. Não relativize a situação. Não promova revitimização.",
    "d": [
     "Dialogar com os envolvidos, esclarecendo impactos do preconceito e promovendo reflexão sobre diversidade e respeito",
     "Agendar a atuação do Psicólogo da Educação para o encontro com os grupos e foco no acolhimento, quando necessário.",
     "Orientar sobre o acesso ao programa de apoio psicológico para servidores públicos, quando estes estiverem envolvidos (em situação de vítima).",
     "Em ambos os casos, articular o acesso aos serviços da RAPS (Rede de"
    ]
   },
   {
    "k": "b",
    "t": "Dialogar com os responsáveis pelos estudantes envolvidos dando ciência sobre o episódio e orientando sobre procedimentos, direitos e deveres.",
    "d": [
     "Registrar em ata e/ou recurso equivalente, o atendimento da família, assim como, os combinados (com data e assinatura do responsável);",
     "Informar as famílias sobre o direito de registro de Boletim de Ocorrência a ser registrado pelo responsável legal da vítima, caso manifestem desejo."
    ]
   },
   {
    "k": "c",
    "t": "Registrar o episódio na Plataforma Conviva.",
    "d": [
     "Descrever o fato detalhadamente respeitando elementos como data, hora, local (sala de aula, por exemplo) e identificação de quem realizou a mediação;",
     "Apontar as ações de mediação previstas/planejadas/combinadas;",
     "Encartar os registros e evidências das providências tomadas antes de encerrar o chamado."
    ]
   },
   {
    "k": "d",
    "t": "Solicitar a preservação das imagens captadas do fato pelo sistema de videomonitoramento, quando necessário.",
    "d": [
     "Preservar evidências em caso de registros em mensagens escritas, prints, imagens ou áudios."
    ]
   },
   {
    "k": "e",
    "t": "Consultar o “Plano de Melhoria da Convivência Escolar” (PMCE) para verificar se há ações que contemplem essa temática.",
    "d": [
     "Avaliar se as ações do PMCE vigente estão atingindo os objetivos esperados;",
     "Planejar ações complementares – em caso de recorrência do tema entre os registros realizados na Plataforma Conviva – e construir estratégias de monitoramento voltadas para prevenção de novos casos;",
     "Articular junto ao Grêmio Estudantil parcerias e projetos para engajar ações e/ou atividades pedagógicas de conscientização junto aos estudantes.",
     "Propor ações preventivas ou campanhas sobre diversidade cultural, inclusão e direitos humanos;",
     "Realizar atividades e diálogos de conscientização em sala de aula."
    ]
   },
   {
    "k": "f",
    "t": "Em caso de envolvimento de Servidor Público, encaminhar relatório à Unidade Regional de Ensino - Supervisor da Unidade Escolar, para possível abertura de diligência e/ou apuração preliminar, quando esse for o autor da discriminação."
   },
   {
    "k": "g",
    "t": "Articular parcerias com os serviços da rede protetiva (UBS, CAPS, CRAS/CREAS, Conselho Tutelar, entre outros), buscando diálogo para continuidade das tratativas de acolhimento – quando se fizer necessário – e em ações integradas que promovam a (in)formação, assim como, possibilitem o acesso e acompanhamento de pessoas em situação de sofrimento, caso necessário."
   }
  ]
 }
];
