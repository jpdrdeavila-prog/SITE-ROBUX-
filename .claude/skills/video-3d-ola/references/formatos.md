# Biblioteca de formatos (estudo dos 10 reels mais vistos dos 2 perfis de referência, 21/11/2026)

Base: storyboard de 76 páginas, 5 reels mais vistos de cada perfil (1,9 a 4,7 milhões de views cada;
28 a 149 mil compartilhamentos). Use os FORMATOS (a estrutura), nunca os textos, títulos, cenas ou marcas.
Modelo técnico de cada módulo: `videos/exemplo-formatos.js`.

## As 9 leis dos vídeos que passam de 1 milhão
1. **Tema do momento**: algo que o público JÁ está discutindo hoje (no grupo de WhatsApp, no jornal). Nenhum tema atemporal.
2. **Primeira frase = a informação-choque.** Sem "oi", sem apresentação. Número grande, resposta-surpresa ou o boato em forma de pergunta.
3. **Uma metáfora-palco por vídeo** (ringue, balança, globo, púlpitos, plenário, dominó, sala no escuro, rolo de filme, porta de balada).
   O cenário muda pouco; o que muda são etiquetas e números por cima.
4. **Fundo escuro + 1 cor de destaque** (a nossa: verde-lima `#b6ff3b`) + objetos brancos/cinza. O destaque só no que importa.
5. **Módulo repetido** que o público aprende (CHECAGEM 1/6…6/6, ROUND 1/2/3, ANTES · A ÁGUA / ANTES · A CARTEIRA).
6. **Fontes na tela** e **os dois lados** (termina com "os dois erraram", "o outro lado", ressalva).
7. **Título de capítulo em frase completa** no topo (lê sem som): "A torneira depende da luz", "O novo Banco Master?".
8. **Utilidade prática** no fim: "no seu bolso", "a dica do holerite", "o que fazer".
9. **CTA de ação ligado ao tema**: "Manda pra quem…" (gera envio) + "Comenta ESTÉREO" (gera comentário).

Duração dos campeões: 79 a 159 s (alvo: 90 a 110 s). Capítulos: 6 a 11, de 5 a 20 s cada.

---

## FORMATO 1 · CHECAGEM ("o que foi verdade e o que foi mentira")
Quando: debate, discurso, entrevista, propaganda, frase viral de político ou empresa.
```
GANCHO      "A gente checou o que foi verdade e o que foi mentira em <evento>."
CONTEXTO    fontes de todos os lados (veículos de direita, de esquerda, dados oficiais) → credibilidade
CHECAGEM N/M  (repetir 4 a 6 vezes, mesmo plano):
            cartão de citação "FULANO DISSE: ..."  → personagem no púlpito sob holofote
            → selo FALSO / EXAGERADO / VERDADEIRO  → régua com o dado e a fonte
VIRADA      "E quem checa o checador?" (um erro dos próprios checadores ou dos dois lados)
RESUMO      "os dois erraram" / placar final
CTA
```
Motor: `pulpit` + `spotlight` + `person`, cabeçalho `quote` (citação) e `seal` (selo), `card` para a régua de dado.
Pílula: `CHECAGEM 1/6`, `CHECAGEM 2/6`...

## FORMATO 2 · BOATO OU FATO? ("Calma, que eu te explico")
Quando: corrente de WhatsApp, vídeo viral, "dizem que vai acontecer X" (apagão, taxa do Pix, fim do 13º, estocar comida).
```
GANCHO      repetir o boato como PERGUNTA + "Calma, que eu te explico."
O BOATO     o que está circulando (balão de fala, celular)
O QUE TEM POR TRÁS   o fato real, com fonte
SELOS       ✓ CONFIRMADO  ×  NÃO CONFIRMADO  (ou BOATO)
O QUE FAZER         a parte prática (a conta na tela: "3 L × 4 pessoas × 3 dias = 36 L")
E O BRASIL?         trazer para a vida de quem assiste
VEREDITO + "Manda pra quem tá compartilhando isso."
```
Motor: `bubble` (balão), `seal: 'CONFIRMADO' | 'NÃO CONFIRMADO' | 'BOATO'`, objetos práticos (`backpack`, `bottle`, `flashlight`, `phone`).

## FORMATO 3 · RINGUE / DUELO ("quem manda mais", "quem ganha")
Quando: comparação entre 2 poderes, 2 empresas, 2 países, 2 produtos.
```
GANCHO      a pergunta de conflito + os 2 personagens frente a frente
O RINGUE    comparação básica (mandato, salário, tamanho...)
ROUND 1 · ROUND 2 · ROUND 3   um critério por round, com placar
O DETALHE   o fato que ninguém sabe ("nunca ninguém tirou um ministro")
CTA (pergunta: "e pra você, quem ganha?")
```
Motor: `boxingRing`, 2 `person` (acessórios de função), `spotlight` em quem ganha o round, `chips` como placar.

## FORMATO 4 · "E NA SUA VIDA?" (notícia aprovada → o que muda pra você)
Quando: lei aprovada, regra nova, reajuste, imposto novo.
```
GANCHO      "<fato> foi aprovado. <placar/número>. E na sua vida? A resposta honesta é:"
NO PAPEL         o que muda (antes → depois)
QUEM FICA DE FORA   quem não é atingido
A CONTA          a matemática na tela
AS PROJEÇÕES     o que cada lado projeta (com fonte)
OS RISCOS / QUEM DEFENDE   os dois lados
O PRECEDENTE     quando já aconteceu algo parecido
A DICA           o que a pessoa faz amanhã (conferir o holerite, o extrato, o app)
CTA
```

## FORMATO 5 · O MUNDO REAGIU (globo)
Quando: eleição, decisão do BC, guerra comercial, crise lá fora que chega aqui.
```
GANCHO      fato + número negativo/positivo gigante ("−20% em Nova York")
CIDADE 1 · CIDADE 2 · O DÓLAR     um número por cidade (o globo gira até ela)
POR QUÊ      a explicação com fonte
ATENÇÃO      a ressalva
NO SEU BOLSO   combustível, eletrônico, viagem
```
Motor: `globeCities` (cidades + arcos), câmera `orbit`, `big` para o número de cada cidade.

## FORMATO 6 · E SE...? (hipótese)
Quando: "se empatar", "se o banco quebrar", "se o Pix cair", "se eu morrer, quem herda".
```
GANCHO      hipótese + resposta-surpresa ("o Lula ganha. E não é por voto.")
A REGRA     a lei/artigo que decide (`book`)
OS NÚMEROS  idades, valores, prazos
JÁ ACONTECEU   casos reais
A CHANCE    probabilidade (quase zero? comum?)
AS OUTRAS REGRAS   2 situações vizinhas
RESUMO em 1 frase
```

## FORMATO 7 · DOMINÓ (causa → consequência)
Quando: "o banco quebrou na terça e o presidente caiu na quinta", efeito cascata.
```
GANCHO      causa e consequência em 2 frases curtas
cada peça = um capítulo (O CONGELAMENTO, O DINHEIRO PÚBLICO, A ACUSAÇÃO, OS FIOS, A QUEDA)
OS FIOS     as ligações entre as pessoas (`wire` brilhante entre os objetos)
A GARANTIA / NO SEU BOLSO
O VEREDITO  ("caiu o banco, caiu a cadeira")
```
Motor: `dominoes` (fall), `key` destaca a peça que derruba as outras, `wire`.

## FORMATO 8 · METÁFORA LÚDICA (explicar regra difícil com algo do dia a dia)
Exemplos: "a lista da porta da balada" (o que entra no plano e o que fica de fora), "o rolo de filme / replay"
(linha do tempo que se repete?), "a sala no escuro" (apagão), "a mochila" (o que levar).
Motor: `partyDoor`, `filmReel` + `replayButton`, `flashlight` + `bg` bem escuro, `backpack`, `bottle`, `satellite` + `signalBars`.

---

## Biblioteca de ganchos (estruturas para escrever NOVOS)
- **Checagem**: "A gente checou o que foi verdade e o que foi mentira em ___."
- **Notícia + placar + pergunta pessoal**: "___ foi aprovado. ___ a ___. E na sua vida?"
- **Fato quente + número gigante**: "___ aconteceu, e ___ caiu ___% em ___."
- **Hipótese + surpresa**: "Se ___, ___ ganha. E não é por ___."
- **Conflito**: "Quem manda mais: ___ ou ___?"
- **Boato + calma**: "___? Calma, que eu te explico."
- **Causa e consequência**: "___ na terça. Na quinta, ___."
- **Notícia que mexe no seu celular/bolso**: "A ___ e a ___ fecharam ___: seu ___ vai ___."

## Biblioteca de CTAs (sempre 2 partes)
1. Envio ligado ao tema: "Manda pra quem ___" (quem tá compartilhando o boato / o sumido / o grupo da família / quem ainda acha que ___).
2. Comentário: "Quer aprender a fazer vídeos assim? Comenta ESTÉREO." ou "Comenta ESTÉREO e receba a próxima explicação."

## Selos e etiquetas de checagem (motor)
| selo | cor | uso |
|---|---|---|
| `CONFIRMADO` / `VERDADEIRO` | verde ✓ | fato com fonte |
| `FALSO` / `BOATO` | vermelho ✕ | desmentido com fonte |
| `EXAGERADO` | laranja ! | número inflado |
| `NÃO CONFIRMADO` / `EM PARTE` | amarelo ? / ≈ | circula sem prova / parcialmente verdade |
| `ADIADO` | azul ⏸ | regra/prazo que mudou de data |
