# Motor 3D "olá": formato do arquivo de vídeo

Um vídeo = um arquivo `videos/<tema>.js` (módulo ES). Modelo completo: `videos/exemplo.js`.
Tudo é função do tempo, então dá para pular para qualquer segundo e renderizar em paralelo.

```js
export default {
  tema: 'PLANO DA HERANÇA',        // aparece em "@ESTEREOLUDICO · PLANO DA HERANÇA"
  handle: '@ESTEREOLUDICO',
  cam: { d: 6.5 },                 // câmera padrão do vídeo (opcional)
  trans: 'pan',                    // transição padrão entre cenas (ver "Transições")
  transDur: 0.75,                  // duração da transição em segundos
  fx: { bloom: 0.55, dof: true },  // brilho e desfoque de fundo (padrão ligado). shadows: 'vsm' = sombra mais macia (2x mais lento)
  cps: 15,                         // letras/s no tempo automático (sem voz)
  segs: [                          // 1 item = 1 legenda. *palavra* = destaque na cor da cena
    'Se você herdar *um milhão*',  // tempo automático
    [3.2, 5.0, 'o governo leva uma parte.'],  // ou tempo manual [início, fim, texto]
  ],
  scenes: [ /* ver abaixo */ ],
};
```
Com voz: `node scripts/sync.js videos/tema.js voz.mp3` cria `videos/tema.tempos.json`, que tem prioridade sobre os tempos acima.

## Cena
```js
{ from: 4,                    // índice da fala em que a cena começa (a cena vai até a próxima)
  pill: 'A INFLAÇÃO',         // nome do capítulo na pílula
  bg: ['#2a0b18', '#6a1a2a'], // [céu topo, horizonte]; chão, névoa e cores @1..@4 saem daqui
  acc: '#ff8f86',             // cor de destaque (palavras *assim*, tag padrão)
  trans: 'pan',               // como esta cena ENTRA: pan | left | up | zoom | pop | flash | none
  cam: { d: 6.5, h: 0.9, ty: 0.55, tx: 0, yaw: 0, orbit: 0, push: 0.07, fov: 30, shake: 0 },
  cam2: { d: 5, yaw: 15, from: 0, to: 4 },  // opcional: câmera viaja de cam -> cam2 (segundos locais; padrão = cena toda)
  fx: ['rain', 'coins'],      // partículas: rain | coins | bills | confetti | sparkle
  keep: false,                // true = objetos não encolhem no fim da cena
  sfx: true,                  // false = sem som de transição nesta cena
  hdr: [ ... ], objs: [ ... ] }
```

## Transições (o que deixa o vídeo "contínuo" como as referências)
| trans | efeito | quando usar |
|---|---|---|
| `pan` (padrão) | câmera desliza para a direita: cena velha sai pela esquerda, nova entra pela direita | troca de capítulo, próximo item de uma lista |
| `left` | igual ao pan, no sentido contrário | voltar a um ponto anterior |
| `up` | mundo desce/sobe na vertical | mudar de assunto, "e aí vem a conta grande" |
| `zoom` | câmera atravessa a cena velha (com clarão leve) | "a lição", revelação, mergulho num detalhe |
| `pop` | objetos velhos encolhem e os novos saltam | dentro do mesmo capítulo, frase seguinte |
| `flash` | clarão branco e corte | CTA final, virada forte |
| `move` | só a câmera viaja até outro ponto do cenário (estilo B) | estilo palco único |
| `none` | corte seco | evitar |

**Objeto que atravessa cenas (`id`)**: dê o mesmo `id` a um objeto em duas cenas seguidas. Ele não sai com a transição:
desliza da posição/tamanho antigos para os novos. Se o `k` for diferente (ex.: `cashBlock` -> `house`), ele **se transforma**
(o velho encolhe, o novo cresce no mesmo lugar, com faíscas). Use para "o dinheiro vira casa", "o logo antigo vira o novo",
"o carro vira planta do terreno". Force com `morph: true/false`.

**Câmera viva**: toda cena tem uma leve aproximação (`push`). Para movimentos de verdade use `cam2` (travelling, subir,
girar em volta), `orbit` (gira devagar) ou `shake: 1` (tremida para impacto). Variar: uma cena de frente, a próxima de lado
(`yaw: -25`), outra de cima (`h: 3, ty: 0.2`).
Tempo dentro da cena: `at: n` = começa na n-ésima fala da cena (0 = primeira); `until: n` = some na fala n.
Também aceita `t0`/`t1` em segundos desde o início da cena.

Câmera: `d` é a distância (6,5 = objeto grande; 8 = cena mais aberta). Visto de cima: `{h: 3, ty: 0.2, d: 6}`.
`orbit: 6` gira 6 graus por segundo; `yaw: -20` dá um ângulo lateral.

### Paletas prontas (bg)
| nome | bg | uso |
|---|---|---|
| preto | `['#0a0a0c','#24242c']` | gancho, lição |
| azul | `['#06174a','#0f3a9a']` | explicação, dados |
| vermelho | `['#2a0b18','#6a1a2a']` | conflito, perda, inflação |
| verde | `['#06221a','#0f4d37']` | dinheiro bom, solução |
| roxo | `['#1f0b2e','#4a1a62']` | proteção, pessoas |
| laranja | `['#2a1405','#8a4110']` | "por que tão caro?" |
| claro | `['#f4f6fa','#dfe4ee']` | explicar algo com calma |
| creme | `['#fbf6ea','#efe6cf']` | sonhos, consumo |

## Cabeçalho (hdr): empilha de cima para baixo
```js
{ num: 'R$ 3,5 MI', sub: 'SEGUNDO O JORNAL X', col: '#7dffb0', at: 1 }        // número gigante em caixa escura
{ count: { from: 1000, to: 630, pre: 'R$ ', suf: ' MI', dur: 1.5, dec: 0 }, sub: 'PODER DE COMPRA' } // número contando
{ title: 'A maneira *mais fácil* de...', box: true, hl: '#ffd24a' }           // título; *trecho* colorido
{ tag: 'JÁ SEM O IMPOSTO', tagc: '#7dffb0', tagf: '#08130d' }                 // pílula mono
{ chips: [['FACHADA', '#3a4bff'], ['PLACA', '#ff8a4a', 1]] }                  // chips; 3º item = at
{ stamp: 'NÃO É O CUSTO DO LOGO', stampc: '#ff5a5f', rot: -6 }                // carimbo torto
{ rows: [['DESVIO', '2 A 12 ANOS'], ['FRAUDE', '4 A 8 ANOS', 2]] }            // tabela; 3º item = at
{ title: 'NÃO VENDE CORRIDA', strike: 0.8 }                                   // título que é riscado depois de 0,8 s
{ timeline: ['2026', '2027', '2028', '2030'], active: lt => lt / 1.2 }        // linha do tempo que acende
{ num: 'R$ 900', sfx: 'cash' }                                                // som específico (ou sfx:false)
```
Para trocar um cabeçalho por outro, usar `until` no primeiro e `at` no segundo (senão eles empilham).

## Objetos (objs)
```js
{ k: 'cashBlock', o: { n: 8, h: 0.9 }, x: 0.3, y: 0, z: 0, s: 1, yaw: -15,
  at: 1, until: 3, type: 'pop',          // entrada: pop | drop (cai) | slide (desliza; from:'left') | rise (cresce) | none
  label: 'FERRARI', labelCol: '#fff',    // rótulo de texto que flutua acima do objeto
  upd: (lt, T) => ({ yaw: lt * 30, y: Math.sin(lt * 2) * 0.05 }) }  // animação extra (lt = s desde que entrou)
{ make: L => L.group(L.coinStack({ n: 30 }), L.text({ txt: 'R$ 1 BI', y: 1.2 })) }  // objeto montado na hora
```
Área útil: x de -0,85 a 0,85; altura de 0 a 1,4. Boneco: s = 0,6 a 0,75. Um objeto-herói grande + no máximo 2 de apoio.
Opções marcadas com (fn) aceitam função do tempo: `level: lt => 0.2 + lt * 0.1`.

### Biblioteca (engine/objects.js)
**Dinheiro**: `cashBlock{n,h,w,d,col}` maços verde-menta brilhantes (assinatura) · `cashCrumble{n,h,p(fn)}` dinheiro esfarelando (perda) ·
`coinStack{n,r,col}` pilha de moedas · `bill` nota solta · `piggy{broken}` cofrinho (rachado = rombo)
**Placas e cartões**: `card{txt,w,h,col,ink,easel}` placa/cartão com texto (easel = cavalete) · `questionBox{txt}` custo desconhecido ·
`ticket{txt}` ingresso · `sign{txt,col:'red'|'yel'|'grn'|'blu',y}` placa pendurada por fio · `calendar{txt,sub}` · `doc{lines}` · `envelope`
**Pessoas**: `man{col,pose,walk,glow}` boneco sem rosto (poses: parado, aceno, apontando, comemorando, pensando, segurando, abertos) ·
`crowd{n,cols,gap,col,hi,hiCol,pose}` multidão (hi = índice destacado) · `eyes{nx,ny}` plateia de olhinhos (atenção/audiência)
**Lugares**: `house{col,roof,w,h}` agência/casa · `field{nx,nz,col,roof,lit(fn),litCol}` centenas de casinhas que vão acendendo ·
`tower{h,lit}` · `skyline{n,lit}` · `pentaHouse{txt,col}` casa-pentágono com nome (TESOURO) · `bank{txt}` prédio com colunas · `car{col}` ·
`globe` planeta · `lotteryGlobe` globo de sorteio girando · `table` · `phone{txt}`
**Fluxo e comparação**: `faucetBucket{level(fn),flow}` torneira enchendo balde (rendimento) · `dome{r,col,stick}` cúpula/guarda-chuva (proteção) ·
`scaleBal{tilt(fn),left,right}` balança (left/right = objetos nos pratos) · `bars{vals,cols,g(fn)}` barras crescendo ·
`steps{labels,lit(fn)}` degraus que acendem (PROTEGE/INVESTE/GASTA) · `arrow{up,col}` · `check` · `xMark` · `clock{speed}` relógio girando
**Revelação e alerta**: `curtain{open(fn)}` cortina que abre · `cage` grade de prisão · `scaffold` obra cara brilhante
**Partículas** (ou use `fx` da cena): `rain{n}` chuva · `coinRain{n}` moedas caindo · `billRain{n}` notas caindo · `confetti{n}` · `sparkles{n,burst}` brilhos
**Extras**: `f1car{col}` carro de corrida · `boat{label}` barco · `water` lâmina d'água · `truck{txt}` caminhão · `storeFront{txt,col,sign}` fachada de loja/agência ·
`logoCard{txt,sub,ink}` cartão de marca genérico (ANTES/DEPOIS) · `trophy` · `podium{labels}` · `magnifier` lupa · `laptop{txt}` · `suitcase` mala ·
`bed` cama · `plane` avião · `bigCoin{txt}` moeda gigante girando · `gavel` martelo de juiz · `lineChart{vals,col,g(fn)}` gráfico de linha que se desenha
**Primitivas**: `box(w,h,d,cor,{x,y,z,rd,glow})`, `sph(r,cor,{...})`, `cyl(r,h,cor,{...})`, `text({txt,h,col,y})`, `group(...)`.
Cores aceitam hex, nomes (`red yel grn blu org cash gold white black`) e tokens do mundo `@1` (bem claro) a `@4` (escuro).

Faltou objeto? Montar com `make: L => L.group(L.box(...), L.sph(...))` no próprio vídeo. Se ficar bom e for reaproveitável,
adicionar em `engine/objects.js` e no `LIB`.

## Regra de variedade
- Pelo menos 1 objeto-assinatura novo e 3 objetos do mundo do tema por vídeo.
- No máximo 2 cenas com o mesmo objeto-herói. Não repetir o mesmo herói em vídeos seguidos.
- Sugestões: loteria = lotteryGlobe; investimento = faucetBucket; garantia = dome; obra/gasto público = scaffold, field;
  crime = cage, envelope, xMark; lançamento/marca = curtain, card{easel}; perda = cashCrumble; audiência = eyes.


## ESTILO B: "Palco único" (ver references/estilos.md)
Modelo completo: `videos/exemplo-palco.js`.
```js
export default {
  acc: '#ffe14a',               // cor de destaque ÚNICA (tags, palavras *assim*, etiquetas, ponto da pílula)
  bg: ['#0b0b0d', '#1f2026'],   // fundo padrão de todas as cenas
  dust: '#ffe14a',              // poeira flutuante na cor de destaque
  fontes: 'CGU · PODER360',     // linha "FONTES: ..." fixa abaixo da pílula (cena pode trocar com fontes:)
  legenda: ['ALICERCE = DINHEIRO', 'PILARES = REGRAS'], // chave da metáfora no canto (cena: legenda:false some)
  fx: { bloom: 0.45, aperture: 0.0035, maxblur: 0.009 }, // desfoque forte de "miniatura"
  trans: 'move',                // padrão: só a câmera viaja entre os pontos do cenário
  moveDur: 1.1,                 // duração da viagem de câmera
  set: [ /* objetos FIXOS do cenário (montados 1 vez, ficam o vídeo todo) */
    { id: 'mesa', make: L => L.desk({ open: t => (t - SEGA(7)) / 0.8 }) },   // t = segundos do VÍDEO; SEGA(7) = início da fala 7
    // use SEGA(i) (e não segundos fixos) para que tudo continue sincronizado quando a voz real chegar
    { id: 'livro', k: 'ledger', o: { hl: 2 }, x: -0.4, y: 0.78, anchorY: 0.5 },
  ],
  scenes: [
    { from: 2, pill: 'O LIVRO',
      cam: { tx: -0.35, ty: 0.8, tz: 0.05, d: 2.7, h: 1.5, yaw: -10 },     // tx/ty/tz = ponto que a câmera olha
      hdr: [ { title: 'O que *entrou*', align: 'left', small: true, kicker: 'O LIVRO-CAIXA' },
             { big: 'R$ 36 MIL', sub: 'FONTE · DATA', at: 1 },            // número gigante no meio-baixo
             { sticker: 'BALANÇO INCOMPLETO', pos: 'mid', at: 2 } ],      // adesivo torto
      callouts: [ { target: 'livro', off: [0.25, 0, 0], t: 'SAIU · R$ 93 MIL', s: 'DECLARADO AO TSE', dx: 40, dy: -110, at: 1 } ] },
  ],
};
```
- **callouts**: `target` = id de um objeto do `set` ou da cena (ou `[x,y,z]` no mundo); `off` desloca o ponto de encaixe;
  `dx/dy` = posição da caixinha em relação ao ponto (px na tela de 720); `t` título, `s` subtítulo; `at/until` como sempre.
  `anchorY` no objeto: 0 = base, 0,5 = meio, 1 = topo (padrão).
- **Cabeçalhos novos**: `big` (número gigante no meio; aceita `count`), `sticker` (adesivo branco torto), `card` ({head, lines[]}
  caixa com contorno da cor de destaque, boa para "linha do tempo de fatos"), `kicker` (etiqueta-moldura acima do `title`),
  `align: 'left'`, `small: true` (título menor), `share: true` (ícone de enviar), `handlePill: true` (@ESTEREOLUDICO grande),
  `pos: 'mid'` (manda qualquer item para o meio-baixo).
- **Pode misturar**: um vídeo do estilo B pode ter `objs` por cena (objetos que entram e saem) além do `set` fixo.

### Objetos de palco (engine/objects.js)
`receipt{lines,hl,redacted}` papel/recibo com linhas tarjadas (hl = linha amarela) · `padlock{open(fn)}` cadeado ·
`ledger{hl,blank}` livro-caixa aberto (blank = linha em branco destacada) · `calculator` · `register{txt}` caixa registradora/contador ·
`cowBank` cofrinho de vaquinha · `ballotBox` urna · `desk{open(fn),drawerItem}` mesa com gaveta que abre ·
`filingCabinet{n,open,k(fn)}` arquivo de aço (gaveta `open` abre com k) · `wallMap{w,h,routes,prog(fn)}` mapa de pontos na parede com rotas em arco que se desenham ·
`lamp` luminária · `safe{open(fn),bars}` cofre oco que abre com barras de ouro · `goldBars{n}` ·
`brickHouse{crack(fn),collapse(fn)}` casa de tijolos com pilares que racha e desaba (metáfora de estrutura) ·
`person{sash,badge,glasses,capCol,suit,pose,walk}` manequim com acessório de função.

## Formatos (references/formatos.md): cabeçalhos e objetos
Cabeçalhos: `{ quote: 'A taxa *triplicou*', who: 'FULANO DISSE' }` (cartão de citação) ·
`{ seal: 'FALSO' | 'EXAGERADO' | 'VERDADEIRO' | 'CONFIRMADO' | 'NÃO CONFIRMADO' | 'BOATO' | 'EM PARTE', sub: 'FONTE', pos: 'mid' }` (selo de checagem) ·
`{ bubble: 'PIX VAI SER TAXADO?', hl: true }` (balão de fala; hl = na cor de destaque).
Objetos: `pulpit{txt}` púlpito com placa · `spotlight{r,on(fn)}` holofote com anel no chão · `boxingRing` ringue ·
`dominoes{n,fall(fn),key}` dominós caindo em sequência · `satellite{beam(fn)}` satélite com feixe · `signalBars{lit(fn)}` barras de sinal ·
`backpack` mochila · `bottle{fill}` garrafa d'água · `flashlight{on(fn)}` lanterna com facho · `filmReel` rolo de filme · `replayButton` botão play ·
`partyDoor{lines,ok}` porta com cordão e lista · `handcuffs` algemas · `halo` auréola · `book{txt}` livro (lei/Constituição) ·
`wire{from,to,sag,prog(fn)}` fio brilhante ligando 2 pontos · `globeCities{cities:[[lat,lon]],arcs:[[i,j]],prog(fn),spin}` globo com cidades e arcos.

## Efeitos sonoros (automáticos)
O motor gera a lista de eventos e o `render.js` monta a trilha sozinho (sons sintetizados, sem direitos autorais):
transição = whoosh (flash = ding, pop = pop) · número/título entrando = pop · contador = tique-tique · carimbo = stamp ·
tag/chip/linha de tabela = tick · objeto `drop` = thud · objeto `pop` = pop baixinho.
Trocar som de um item: `sfx: 'whoosh'|'pop'|'tick'|'stamp'|'thud'|'ding'|'cash'`; desligar: `sfx: false`.
Volume geral: `--sfx 0.6` no render; sem efeitos: `--sem-sfx`.

## Velocidade (referência: 4 núcleos, 3 processos)
Qualidade completa ≈ 0,5 s por quadro por processo. Prévia rápida sem brilho/desfoque: `shot.js ... --rapido`.
Vídeo de 100 s ≈ 15 a 20 min. Sempre rodar em segundo plano e avisar o João.

## Comandos
```bash
node scripts/shot.js videos/tema.js                 # prévia: contact.jpg + lista de cenas e tempos
node scripts/shot.js videos/tema.js saida 15.3 15.5 15.7   # conferir uma transição quadro a quadro
node scripts/shot.js videos/tema.js saida 3 12.5    # quadros em segundos específicos
node scripts/sync.js videos/tema.js voz.mp3         # casa as falas com a narração -> tema.tempos.json
node scripts/render.js videos/tema.js --voz voz.mp3 --musica trilha.mp3 --jobs 3 [--hd]
```
O render retoma de onde parou (pula quadros já prontos em `videos/tema_quadros/`). Apague essa pasta se mudar o vídeo.
