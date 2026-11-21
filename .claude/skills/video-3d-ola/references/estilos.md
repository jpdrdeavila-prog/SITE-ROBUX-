# Material de estudo: os 2 estilos de referência, desmontados quadro a quadro

Analisados em 20 e 21/11/2026: 3 vídeos do criador A ("mundo colorido") e 3 do criador B ("palco único").
Use como escola de ritmo, linguagem visual e roteiro. **NUNCA copie** nome, bordão, textos, títulos de capítulo,
composição de cena ou marca de nenhum dos dois. A identidade é sempre @ESTEREOLUDICO.

---

## ESTILO A: "Mundo colorido" (o padrão da skill)

| Elemento | Como é feito | No motor |
|---|---|---|
| Mundo | Cada capítulo é um "mundo" de uma cor só (fundo, chão, objetos no mesmo tom); só o dinheiro foge (verde-menta brilhante) | `bg` por cena + tokens `@1..@4` |
| Transição | A câmera desliza para o lado, sobe ou atravessa a cena; a cor do mundo muda junto | `trans: pan/up/zoom/pop/flash` |
| Objetos | Low-poly "de brinquedo", arredondados, 1 herói grande + até 2 de apoio | biblioteca `objects.js` |
| Cabeçalho | Pílula do capítulo, número gigante em caixa escura, tags, chips, carimbo torto | `hdr` |
| Ritmo | Capítulo de 8 a 15 s; dentro dele, cabeçalho muda a cada frase; objeto novo a cada 2 a 4 s | `at`/`until` |
| Final | Pergunta que divide + CTA de comentário | `flash` + `title` + `tag` |

Bom para: notícia com muitos números, comparação, linha do tempo, biografia.

---

## ESTILO B: "Palco único" (novo)

### Anatomia de um quadro
```
┌──────────────────────────────────────┐
│ MARCA · TEMA               @handle   │ ← linha mono pequena
│ ● O NÚMERO                           │ ← pílula do capítulo (ponto amarelo)
│ FONTES: CGU · PODER360 · SECOM       │ ← FONTES SEMPRE NA TELA (mono, 50% opacidade)
│ [O PONTO-CHAVE]                      │ ← "kicker": etiqueta-moldura amarela (opcional)
│ O cartão não está no nome deles      │ ← PERGUNTA-TESE (branco, palavra-chave amarela), alinhada à esquerda
│                                      │
│        ┌──────────┐                  │
│   ●────│ SERVIDOR │  ← etiqueta presa ao objeto por linha amarela (callout)
│   │    │ COM CRACHÁ│                 │
│  [objeto do cenário em close,        │
│   fundo desfocado (bokeh)]           │
│                                      │
│          R$ 10,5 MI                  │ ← NÚMERO GIGANTE AMARELO NO MEIO-BAIXO (sem caixa)
│        [EM 2026, ATÉ AGOSTO]         │ ← subtítulo em caixinha preta mono
│ ALICERCE = DINHEIRO                  │ ← legenda da metáfora (canto, fixa)
│ PILARES = REGRAS                     │
│  [ legenda karaokê ]                 │
└──────────────────────────────────────┘
```

### As 10 regras visuais
1. **Um cenário para o vídeo inteiro** (escritório com arquivos e mapa; mesa de tesouraria; duas casas lado a lado).
   Nada "aparece do nada": a câmera **viaja** até o próximo objeto do cenário (`trans: 'move'`).
2. **Mundo neutro + 1 cor de destaque** (amarelo). Cinza, branco, madeira, preto. O amarelo só vai no que importa:
   o número, a linha destacada no papel, o cadeado, a barra de ouro, a rachadura.
3. **Desfoque forte (miniatura)**: closes com fundo muito desfocado. `fx: { aperture: 0.0035, maxblur: 0.009 }`.
4. **Closes de objetos de mesa** ("props"): papel com linhas tarjadas, lupa, cadeado, livro-caixa aberto, calculadora,
   gaveta que abre, cofre que abre com barras de ouro, urna, cofrinho-vaca, carimbo, balança dourada.
5. **Etiquetas presas por linha** (callouts): caixinha preta com título mono branco + subtítulo cinza, ligada ao objeto
   por linha fina amarela com bolinha na ponta. 1 a 3 por cena. Elas são o "zoom de informação".
6. **Pergunta-tese fixa por capítulo** no topo, à esquerda, com 1 palavra em amarelo. Às vezes com "kicker"
   (O NÚMERO / O PONTO-CHAVE / TRADUZINDO / É ASSIM QUE CHAMA).
7. **Número gigante no meio-baixo**, amarelo, sem caixa, com subtítulo em caixinha preta: o dado entra no lugar do
   objeto, não no topo.
8. **Fontes sempre visíveis** numa linha mono abaixo da pílula. Credibilidade o tempo todo.
9. **Legenda da metáfora** fixa no canto quando o vídeo usa uma metáfora-sistema (casa = economia:
   alicerce = de onde vem o dinheiro, pilares = regras, cofre = reservas, rachadura = dívida).
10. **Adesivos tortos** brancos com texto preto para conclusões curtas ("BALANÇO INCOMPLETO", "PERMITIDO", "FECHA EM 14/11").

### Personagens
Manequins brancos sem rosto com 1 acessório que identifica a função: faixa presidencial verde-amarela, crachá de servidor,
óculos de contador, boné de fiscal, terno escuro de autoridade. Nunca caricatura de rosto real.
No motor: `person({ sash, badge, glasses, capCol, suit })`.

### Roteiro do estilo B (padrão observado nos 3 vídeos)
1. **Gancho = pergunta concreta + resposta-choque curta** ("Quanto custaram as viagens? A resposta oficial, numa palavra:
   sigiloso." / "Pix de 13 reais... como assim falta dinheiro?" / "Quão perto o Brasil está de virar X? Com uma vistoria nas duas.").
2. **Bordão** (o nosso: "Vem que eu te explico de forma estérea.").
3. **Metáfora-sistema** apresentada cedo e usada até o fim (vistoria da casa, livro-caixa, gaveta do arquivo).
4. **Capítulos-pergunta**: cada capítulo responde uma pergunta curta (O TOTAL, OS DIAS FORA, QUEM PAGA, O QUE SE ESCONDE,
   ATÉ QUANDO, A REGRA, O PRAZO, OS OUTROS).
5. **"Traduzindo:"**: depois de um termo técnico, uma frase em linguagem de rua.
6. **"E aqui a história vira."**: virada no meio (o ponto que muda a leitura do caso).
7. **Os dois lados explícitos**: "O governo diz... / Os críticos dizem..." ou "Segurança ou transparência?" com balança.
8. **"Não é só X"**: mostra que outros (inclusive do lado oposto) fazem o mesmo. Neutralidade.
9. **Laudo/veredito curto** no fim ("Longe de desabar, mas rachadura não fecha sozinha").
10. **CTA de compartilhar** ("Manda pra quem..." + ícone de enviar) + seguir. Gera envio em grupo (alcance).

### Tempo
85 a 114 s; 8 a 10 capítulos; legenda de 2 a 6 palavras; a câmera muda de ponto a cada 4 a 8 s;
etiqueta nova a cada 2 a 3 s.

---

## Quando usar cada estilo
| Tema | Estilo |
|---|---|
| Muitos números de áreas diferentes, comparação entre países/empresas, biografia, "placar" | **A (mundo colorido)** |
| Um caso único com documentos, contas, sigilo, investigação, prestação de contas, "por dentro de" | **B (palco único)** |
| Metáfora forte que dá para montar como cenário (casa = economia, cofre = reservas) | **B** |
| Notícia leve, curiosidade, "quanto custa" | **A** |

## Checklist de nível (B)
- [ ] O cenário aparece inteiro no 1º plano e depois só em closes (o público "conhece a sala").
- [ ] Toda cena tem 1 a 3 etiquetas presas a objetos.
- [ ] Amarelo só em 1 coisa por quadro (além do texto).
- [ ] Fontes na linha de fontes; números grandes com subtítulo de origem e data.
- [ ] Pelo menos 3 objetos com movimento próprio (gaveta abrindo, cofre abrindo, rota no mapa, papel com linha acendendo).
- [ ] Final de compartilhar + `handlePill`.

---

## ATUALIZAÇÃO 21/11/2026: o que os 10 mais vistos mostram (storyboard de 76 páginas)
- Os DOIS criadores convergiram para o mesmo visual: **fundo escuro + 1 cor de destaque + metáfora-palco**.
  O "mundo colorido por capítulo" (estilo A) aparece menos nos vídeos campeões.
- O sucesso vem do **formato repetível** (checagem, rounds, boato × fato) e do **tema do dia**.
- Compartilhamentos altíssimos (28 mil a 149 mil) vêm de: tema polêmico ou útil + CTA "manda pra quem…".
- Detalhe técnico: legenda com a palavra falada na cor de destaque; selos verde ✓ / amarelo "não confirmado";
  título de capítulo em frase completa; personagem sob holofote com anel de luz no chão.
Detalhes e roteiros-modelo: `references/formatos.md`.
