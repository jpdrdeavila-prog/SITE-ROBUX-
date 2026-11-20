---
name: video-3d-ola
description: Quando João mandar "olá" (ou "ola", "oi, vamos criar"), cumprimentar com "Bom dia/Boa tarde/Boa noite, João! O que vamos criar hoje?", ouvir a ideia, fazer TODAS as perguntas necessárias para não errar o vídeo e então criar o vídeo 3D explicativo vertical (estilo dinheiro/bolso, @ESTEREOLUDICO) do roteiro ao MP4, com o motor 3D próprio desta skill.
---

# video-3d-ola: vídeo 3D explicativo do "olá" ao MP4

Usuário: **João** (leigo em programação). Responder sempre em português do Brasil, frases curtas, sem jargão.
Quando precisar que ele rode algo, entregar comando pronto para copiar e colar.

## 1. Gatilho e saudação (exatamente assim)
Quando João mandar "olá" (ou "ola", "oi", "oie"), descobrir a hora de Brasília:
`TZ=America/Sao_Paulo date +%H` → 05–11 "Bom dia", 12–17 "Boa tarde", 18–04 "Boa noite".
Responder SOMENTE:

> **Boa tarde, João! O que vamos criar hoje?**

(com a saudação certa para a hora). Não fazer mais nada até ele mandar a ideia.

## 2. Perguntas: não começar sem elas
Depois da ideia, fazer a rodada de perguntas de `references/perguntas.md`.
- Ler a ideia e **só perguntar o que ainda não está claro**. Se ele já respondeu algo na ideia, não repetir.
- Para cada pergunta, mostrar uma **sugestão padrão** entre colchetes. João pode responder só "padrão" ou "ok".
- Se houver ferramenta de perguntas com botões (AskUserQuestion), usar em blocos de até 4 perguntas. Senão, lista numerada em **no máximo 2 mensagens** (bloco A+B e depois C+D+E).
- No fim, mandar o **RESUMO DO PEDIDO** (modelo no fim de `perguntas.md`) e esperar "ok" antes de pesquisar.
- Se em qualquer etapa surgir dúvida nova (número que não bate, dado sem fonte, tema sensível), **perguntar de novo antes de seguir**. Nunca chutar.

## 3. Fluxo com 3 pontos de aprovação
1. **Pesquisa**: 4 a 8 fontes confiáveis e recentes (com data). Montar a TABELA DE FATOS: dado | valor | fonte | data.
   Dado sem fonte não entra. Fontes que divergem: avisar João e perguntar qual usar. Tema político: neutro, os dois lados.
2. **Roteiro** (regras em `references/roteiro.md`): gancho com 3 opções para ele escolher, falas e tabela de cenas
   `| # | fala | objeto 3D e animação | número/tag na tela | cor |`.
   → ✅ **APROVAÇÃO 1**: João aprova o roteiro (ou pede ajustes).
3. **Texto da narração** para ElevenLabs ou para ele gravar: mesmas falas, **números por extenso** ("três vírgula cinco milhões"),
   siglas soletradas quando preciso, pausas com reticências. Se a escolha for "sem voz", pular.
4. **Arquivo do vídeo** `videos/<tema>.js` no formato de `references/motor.md`. Copiar `videos/exemplo.js` como base.
5. **Prévia**: `node scripts/shot.js videos/<tema>.js` gera `contact.jpg` (1 a 3 quadros por cena). Olhar a folha antes de mandar
   (checagem do item 5). Conferir também cada transição com 3 quadros (início, meio e fim: `shot.js ... saida T0 T0+0.3 T0+0.6`).
   Corrigir e gerar de novo até ficar limpo.
   → ✅ **APROVAÇÃO 2**: mandar a folha de contato para o João.
6. **Voz**: quando o MP3 chegar, rodar `node scripts/sync.js videos/<tema>.js voz.mp3`, conferir a tabela de tempos impressa
   (cada fala no lugar certo) e gerar a prévia de novo.
7. **Render**: `node scripts/render.js videos/<tema>.js --voz voz.mp3 [--musica trilha.mp3] --jobs 3`
   (rodar em segundo plano e avisar o João; 100 s de vídeo ≈ 15 a 20 min com 3 processos em 4 núcleos).
   Efeitos sonoros entram sozinhos (whoosh, pop, tique do contador, carimbo); `--sfx 0.6` abaixa, `--sem-sfx` desliga.
   Sem voz: `node scripts/render.js videos/<tema>.js --musica trilha.mp3` (tempo automático de 15 letras/s).
8. **Conferência final**: extrair 1 quadro a cada 5 s (`ffmpeg -i video.mp4 -vf fps=1/5,scale=240:-1,tile=6x4 conf.jpg`) e olhar.
   → ✅ **APROVAÇÃO 3**: entregar o MP4 + legenda do post + fontes do 1º comentário + horário sugerido (18h).

## 4. Identidade (obrigatória)
- Conta **@ESTEREOLUDICO**. Linha do cabeçalho: `@ESTEREOLUDICO · TEMA` (o motor já faz isso com `handle` e `tema`).
- Frase-ponte: **"Vem que eu te explico de forma estérea."**
- CTA final: **"Quer aprender a fazer vídeos assim? Comenta ESTÉREO."**
- PROIBIDO copiar o criador de referência: nada de "Ludificando", "LÚDICO", "forma lúdica", "Comenta LÚDICO",
  nem textos, nomes de capítulo ou cenas iguais aos vídeos de referência. Usar a referência só como modelo de ritmo e estrutura.
- Objetos sempre genéricos, sem logotipo real de marca. Nome de empresa pode aparecer como texto (ex.: "FERRARI" como rótulo).

## 5. Nível de acabamento (obrigatório, é o que deixa igual às referências)
- **Mundo contínuo**: toda troca de capítulo com transição (`pan`, `up`, `zoom`); `pop` só dentro do mesmo capítulo; `flash` no CTA.
- **Pelo menos 2 objetos que atravessam cenas** com `id` (o dinheiro que vira casa, o logo antigo que vira o novo...).
- **Câmera viva**: no mínimo 3 cenas com `cam2` (travelling), `orbit` ou ângulo lateral/de cima. Nunca 3 cenas seguidas com a mesma câmera.
- **Partículas** onde fizer sentido: `coins`/`bills` em dinheiro entrando, `rain` em clima tenso, `confetti` no fim, `sparkle` em revelação.
- **Objeto-herói grande** e brilhante (dinheiro com glow), bloom e desfoque ligados (padrão).
- **Objetos sob medida** para o tema quando a biblioteca não tiver: montar com `make` (primitivas) e, se ficar bom, salvar em `objects.js`.
- **Cabeçalho mudando a cada frase** (número, tag, chip, contador, carimbo, título riscado).

## 6. Checagem antes de mandar qualquer prévia ou vídeo
- [ ] Todo número da tela = número da fala = número da tabela de fatos (mesmo arredondamento).
- [ ] Datas e "hoje/ontem/segunda" batem com o dia em que João vai postar.
- [ ] Ortografia e acentos (ç, ã, é) certos em legenda, tags e cabeçalho.
- [ ] Nenhum cabeçalho sobreposto ou cortado na borda; legenda sem cobrir o objeto principal.
- [ ] Uma ideia por cena, objeto-herói grande no centro, no máximo 1 número grande por vez.
- [ ] Ressalvas onde precisa: "ESTIMATIVA", "EXEMPLO, NÃO RECOMENDAÇÃO", "SEGUNDO <FONTE>".
- [ ] CTA "Comenta ESTÉREO" no fim. Nenhum texto do criador de referência.
- [ ] Duração entre 85 e 110 s (ou o que João pediu).

## 7. Teste do ambiente (fazer em silêncio logo depois da saudação, antes das perguntas)
Rodar: `node -v && ffmpeg -version | head -1 && node -e "require('playwright')" && node scripts/shot.js videos/exemplo.js /tmp/teste 3`
- Funcionou: seguir o fluxo completo normalmente.
- Falhou: tentar instalar uma vez (`npm i -g playwright && npx playwright install chromium`; ffmpeg pelo gerenciador de pacotes).
  Se ainda falhar, avisar o João em 1 frase: "Aqui eu consigo fazer as perguntas, o roteiro, a narração e o arquivo do vídeo,
  mas não consigo gerar o MP4. Para renderizar, abra o Claude Code (claude.ai/code) e mande: renderize videos/<tema>.js."
  E entregar o arquivo `videos/<tema>.js` pronto para ele baixar.
- Se os comandos tiverem limite de tempo, renderizar em partes (o render.js retoma de onde parou: basta rodar de novo).

## 8. Onde trabalhar / requisitos
- Pasta da skill = pasta deste SKILL.md. Se ela for somente leitura, copiar `engine/`, `scripts/` e `videos/exemplo.js`
  para uma pasta de trabalho e rodar de lá (os scripts acham o motor por `../engine`).
- Precisa de Node 18+, ffmpeg e Playwright com Chromium. Testar: `node -e "require('playwright')"`.
  Se faltar: `npm i -g playwright && npx playwright install chromium`.
- Se o render falhar com WebGL, rodar `node scripts/shot.js videos/exemplo.js` para isolar o problema e ler os ERROS impressos.

## Arquivos
- `references/perguntas.md`: banco de perguntas + modelo do RESUMO DO PEDIDO.
- `references/roteiro.md`: fórmula de roteiro (análise dos vídeos de referência), legenda do post, regras de números.
- `references/motor.md`: formato do arquivo de vídeo, cabeçalhos, câmera e lista de objetos 3D.
- `engine/`: motor 3D (Three.js + HTML). `scripts/`: shot.js (prévia), sync.js (voz), render.js (MP4).
- `videos/exemplo.js`: vídeo-modelo de 32 s com todas as transições, morph, câmera viajando, partículas e sons.
- `scripts/sfx.js`: efeitos sonoros sintetizados (usado pelo render.js).
