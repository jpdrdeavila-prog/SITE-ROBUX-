# Estúdio Estéreo: o piloto automático dos vídeos

Um site estilo n8n onde uma equipe de agentes do Claude faz o vídeo do dia sozinha e conversa entre si para acertar:

```
Pesquisador ──► Checador ──► Roteirista ──► Revisor
 (web)          (web)                         │
                                              ▼
Render MP4 ◄── Sincronizar ◄── Voz ◄──── Diretor de cenas (motor 3D)
   │
   ▼
Redator (legenda + fontes) ──► SUA APROVAÇÃO ──► Postar no Instagram (+ fontes no 1º comentário)

Todo dia à noite: Analista lê as métricas → relatório → recado para o Pesquisador do dia seguinte
```

Como eles conversam:
- O **Checador** confere cada fato na web. Se achar erro, devolve ao **Pesquisador**, que corrige. Até 3 rodadas.
- O **Revisor** dá nota ao roteiro. Abaixo de 8, o **Roteirista** reescreve. Até 3 rodadas.
- O **motor 3D** testa o arquivo do **Diretor**. Se der erro, o Diretor recebe o erro e corrige. Até 3 tentativas.
- O **Analista** manda um recado para o Pesquisador com o que funcionou nas métricas.

Tudo aparece no painel: os nós acendem conforme cada etapa termina, e a aba "Conversa dos agentes" mostra quem falou o quê, com as fontes.

## O que você precisa configurar (página "Configurações" do painel)

| Chave | Para quê | Onde pegar | Obrigatória? |
|---|---|---|---|
| ANTHROPIC_API_KEY | os agentes (Claude) | console.anthropic.com → API Keys | **Sim** |
| ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID | voz automática | elevenlabs.io → Profile → API Key; o ID da voz fica em Voices → (sua voz) → ID | Não: sem elas, o painel pede o MP3 e você envia |
| INSTAGRAM_TOKEN + INSTAGRAM_USER_ID | postar e ler métricas | Meta for Developers (passo a passo abaixo) | Não: sem eles, você baixa o MP4 e posta pelo app |
| PUBLIC_BASE_URL | o Instagram baixa o vídeo deste endereço | o domínio do seu servidor (ex.: https://estudio.seudominio.com) | Só para postar automático |
| TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID | avisos no celular (aprovar, erro, relatório) | fale com @BotFather no Telegram | Não |
| PAINEL_SENHA | protege o painel (usuário: qualquer um, senha: esta) | você inventa | **Sim** se o painel estiver na internet |

As chaves ficam só no arquivo `.env` do servidor. Elas nunca aparecem na tela nem vão para o GitHub.

Depois de salvar, clique em **Testar conexões**: aparece ✅ ou ❌ para Claude, ElevenLabs, Instagram e Telegram.

### Instagram (token da Graph API)
1. A conta @estereoludico_ precisa ser **Profissional (Criador ou Empresa)** e estar ligada a uma **Página do Facebook**.
2. Em developers.facebook.com, crie um app do tipo "Empresa" e adicione o produto **Instagram** (API do Instagram com login do Facebook).
3. Gere um token com as permissões `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`.
4. Troque pelo token de **longa duração** (60 dias). Renove antes de vencer.
5. O `INSTAGRAM_USER_ID` é o ID da conta do Instagram (aparece no Explorador da Graph API em `me/accounts?fields=instagram_business_account`).

Observação: a música da biblioteca do Instagram **não** pode ser colocada pela API. Se quiser música do Instagram, deixe a aprovação ligada e poste pelo app.

## Onde rodar

O render do vídeo 3D é pesado (cerca de 15 a 20 min para 70 s com 3 processos). Duas opções:

**A) Servidor na nuvem (recomendado, roda mesmo com o seu computador desligado)**
Uma VPS Linux com 4 vCPUs e 8 GB de RAM e Docker instalado. Na pasta do repositório:
```bash
mkdir -p estudio/dados && cp estudio/.env.example estudio/dados/.env   # ou preencha depois pelo painel
docker compose -f estudio/docker-compose.yml up -d --build
```
Abra `http://IP-DO-SERVIDOR:3000`. Para postar automático, aponte um domínio com HTTPS para ele (ex.: Caddy ou Cloudflare) e coloque esse endereço em PUBLIC_BASE_URL.

**B) No seu computador**
Precisa de Node 20+ e ffmpeg instalados. Na pasta `estudio`:
```bash
npm install
npx playwright install chromium
npm start
```
Abra http://localhost:3000. Ele só trabalha enquanto o computador estiver ligado. Para postar automático daqui, use um túnel (ex.: Cloudflare Tunnel) e coloque o endereço em PUBLIC_BASE_URL.

## Usando no dia a dia

- **Rodar agora**: aba Fluxo → escreva a ideia (ou deixe vazio para o Pesquisador escolher) → escolha o estilo → ▶ Rodar fluxo.
- **Piloto automático**: Configurações → ligue a agenda. Padrão: começa às 09:00, posta às 18:00, relatório às 21:30 (horário de Brasília). Estilos em rodízio A → B → C.
- **Aprovar**: quando o vídeo fica pronto, aparece o player, a legenda e o botão ✅ Aprovar. Aprovado antes das 18:00, ele espera e posta no horário.
- **Corrigir**: clique em qualquer nó → "Refazer a partir daqui" (ex.: refazer só as cenas, ou só a legenda).
- **Fila de ideias**: escreva ideias suas (uma por linha) em Configurações, ou clique "+ fila" nas ideias do relatório. Elas passam na frente da pesquisa.
- **Gasto**: cada execução mostra o gasto estimado em dólar. Para gastar menos, troque o "Modelo dos revisores" para `claude-sonnet-5-5`.

## Testar sem gastar nada
```bash
npm run simular
```
Os agentes respondem com textos de teste e o resto (motor 3D, sincronização, render, painel) roda de verdade.

## Segurança
- Deixe **"Esperar minha aprovação"** ligado: nada vai para o Instagram sem você ver.
- Use PAINEL_SENHA se o painel estiver na internet.
- O link público do vídeo tem uma chave aleatória; só o MP4 aprovado fica acessível por ele.
