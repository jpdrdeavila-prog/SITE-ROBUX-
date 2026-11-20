# Motor 3D "olá": formato do arquivo de vídeo

Um vídeo = um arquivo `videos/<tema>.js` (módulo ES). Modelo completo: `videos/exemplo.js`.
Tudo é função do tempo, então dá para pular para qualquer segundo e renderizar em paralelo.

```js
export default {
  tema: 'PLANO DA HERANÇA',        // aparece em "@ESTEREOLUDICO · PLANO DA HERANÇA"
  handle: '@ESTEREOLUDICO',
  cam: { d: 6.5 },                 // câmera padrão do vídeo (opcional)
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
  cam: { d: 6.5, h: 0.9, ty: 0.55, tx: 0, yaw: 0, orbit: 0, push: 0.07, fov: 30 },
  keep: false,                // true = objetos não encolhem no fim da cena
  hdr: [ ... ], objs: [ ... ] }
```
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
**Primitivas**: `box(w,h,d,cor,{x,y,z,rd,glow})`, `sph(r,cor,{...})`, `cyl(r,h,cor,{...})`, `text({txt,h,col,y})`, `group(...)`.
Cores aceitam hex, nomes (`red yel grn blu org cash gold white black`) e tokens do mundo `@1` (bem claro) a `@4` (escuro).

Faltou objeto? Montar com `make: L => L.group(L.box(...), L.sph(...))` no próprio vídeo. Se ficar bom e for reaproveitável,
adicionar em `engine/objects.js` e no `LIB`.

## Regra de variedade
- Pelo menos 1 objeto-assinatura novo e 3 objetos do mundo do tema por vídeo.
- No máximo 2 cenas com o mesmo objeto-herói. Não repetir o mesmo herói em vídeos seguidos.
- Sugestões: loteria = lotteryGlobe; investimento = faucetBucket; garantia = dome; obra/gasto público = scaffold, field;
  crime = cage, envelope, xMark; lançamento/marca = curtain, card{easel}; perda = cashCrumble; audiência = eyes.

## Comandos
```bash
node scripts/shot.js videos/tema.js                 # prévia: contact.jpg + lista de cenas e tempos
node scripts/shot.js videos/tema.js saida 3 12.5    # quadros em segundos específicos
node scripts/sync.js videos/tema.js voz.mp3         # casa as falas com a narração -> tema.tempos.json
node scripts/render.js videos/tema.js --voz voz.mp3 --musica trilha.mp3 --jobs 3 [--hd]
```
O render retoma de onde parou (pula quadros já prontos em `videos/tema_quadros/`). Apague essa pasta se mudar o vídeo.
