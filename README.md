# KURIO — Marketplace demonstrativo de NFTs

Aplicação React e TypeScript para descoberta de arte digital, carrinho, compra simulada e conta do colecionador. O projeto segue a identidade escura e âmbar do arquivo de referência `Frontend Challenge.png`; as imagens das quatro primeiras peças usam as artes fornecidas separadamente; as demais usam ilustrações SVG locais, pois o ZIP original não continha arquivos de arte individuais.

## Início rápido

Requer Node.js 20+ e npm. Em um checkout limpo:

```bash
npm install
npm run dev
```

O MSW inicia automaticamente no navegador e simula a API; `WebSocketInterceptor` junto de `@mswjs/socket.io-binding` simula o protocolo Socket.IO. Para desativar os mocks, defina `VITE_MOCKS=false`; sem um backend real em `/api` e Socket.IO na origem atual, a aplicação não terá dados.

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desenvolvimento com MSW |
| `npm run build` | Verificação TypeScript e build otimizado |
| `npm run preview` | Preview do build |
| `npm run typecheck` | Verificação de tipos |
| `npm run lint` | Lint |
| `npm run test:e2e` | Playwright Chromium |
| `npm run lighthouse` | Build otimizado e três medições Lighthouse por página no perfil desktop |
| `npm run lighthouse:mobile` | Build otimizado e três medições Lighthouse por página no perfil mobile |
| `npm run lighthouse:summary` | Medianas de score e LCP/CLS/TBT em Markdown |

A interface usa a família Roboto Mono em peso 400 (Regular), carregada localmente pelo pacote `@fontsource/roboto-mono`. As artes do catálogo são resolvidas por família do nome da obra, então IDs diferentes com o mesmo nome-base compartilham a imagem. Moss Traveler, Solar Dream, Cosmic Bloom, Jungle Echo, Amber Nomad, Quiet Orbit e Lilac Voyager recebem uma das quatro fotos por seleção pseudoaleatória estável, calculada a partir do nome-base. A área de conta inclui as abas Dados do perfil, Carteiras, Atividade, Lista de interesse, Ofertas, Arquivos baixados e Suporte. `Sair` encerra a sessão simulada.

## Cenários de demonstração

- Cadastro livre; e-mails repetidos retornam conflito e senha menor que oito caracteres retorna erro.
- Conta inicial 1: `alex@kurio.art` / `kurio123`.
- Conta inicial 2: `marina@kurio.art` / `kurio123`.
- O cupom `KURIO10` aplica 10%; qualquer outro código retorna erro inválido/expirado.
- A primeira peça recebe um evento de preço/disponibilidade após 15 segundos conectado. O cliente aplica eventos por versão, ignora versões antigas e invalida o resumo. O handler `/api/orders` é idempotente pela chave `Idempotency-Key`.
- `POST /api/orders?decline=1` permite exercitar recusa pela API mockada.
- O estado local fica no `localStorage` sob a chave `kurio:*`. Limpe os dados do site ou execute `localStorage.clear()` no console e recarregue para restaurar as fixtures iniciais. Contas adicionais e seus digests de senha persistem após refresh.

## Contratos

Todos os endpoints usam JSON e passam pelo cliente Axios em `/api`.

| Método e rota | Autenticação | Propósito |
| --- | --- | --- |
| `GET /session`, `POST /session/login`, `POST /session/register`, `POST /session/logout` | Sessão | Consultar e alterar sessão |
| `GET /nfts?q&category&sort&page`, `GET /nfts/:id` | Pública | Listar/detalhar obras |
| `GET /favorites`, `POST /favorites/:id`, `DELETE /favorites/:id` | Simulada | Favoritos |
| `GET /cart`, `POST /cart`, `PATCH /cart/:id`, `DELETE /cart/:id` | Carrinho visitante | Carrinho |
| `POST /quote` (`coupon`) | Pública | Cotação, desconto e taxa de rede |
| `POST /orders` + `Idempotency-Key`, `GET /orders/:id` | Simulada | Pedido e snapshot do recibo |
| `GET /profile`, `PUT /profile`, `GET /wallets`, `POST /wallets`, `PUT /wallets/:id` | Simulada | Perfil e carteiras |

Erros são respostas HTTP 401/404/409/422 com `{ message }`. Sessão, carrinho, favoritos, perfil, carteiras e pedidos são mockados no navegador. O MSW é a camada de transporte; componentes não importam fixtures.

### Eventos Socket.IO

O cliente Socket.IO conecta no endpoint `/socket.io/` da origem atual, com transporte WebSocket, e emite `subscribe`. O cenário de demonstração usa `WebSocketInterceptor` de `@mswjs/interceptors` e o binding `toSocketIo` de `@mswjs/socket.io-binding` para interpretar o protocolo. A REST usa os handlers MSW; os mesmos dados mockados são alterados pelo cenário de socket e persistidos no storage:

- `nft.updated`: `{ id, resource: 'nft', price, supply, version }` atualiza catálogo/detalhe e invalida carrinho/cotação.
- `order.updated`: `{ id, status, version }` está reservado para atualizações do pedido.

O binding suporta eventos textuais no namespace padrão, sem namespaces customizados, acknowledgements ou anexos binários. A fixture de alteração de mercado é disparada pela conexão mockada; isso é uma simulação local, não um servidor Socket.IO de produção.

## Sessão, estado e cache

A sessão recupera o usuário do storage local; somente o digest SHA-256 da senha fictícia é persistido, nunca a senha em claro. Queries usam chaves com filtros/ordenação/página e cache curto (`staleTime: 20s`, `gcTime: 5 min`); Axios recebe o `AbortSignal` do TanStack Query para descartar consultas obsoletas. Retry de leitura é limitado a uma tentativa; mutations não são repetidas automaticamente. Favoritos aplicam atualização otimista com rollback. Logout limpa o QueryClient inteiro e encerra dados privados. O carrinho visitante persiste no mesmo storage e é mantido após autenticação.

O recibo usa snapshot dos itens e valores criado no momento do pedido. A taxa simulada é 2,5%. Uma conexão de carteira, assinatura blockchain e pagamento são apenas estados demonstrativos, sem transação real.

## Testes e auditoria

Os testes Playwright usam `playwright.config.ts`, MSW e Chromium em 1440×1000, 768×1024 e 390×844. Para executar em uma máquina nova é necessário instalar o browser: `npx playwright install chromium`. `npm run lighthouse` e `npm run lighthouse:mobile` geram três auditorias por página nos perfis desktop e mobile. Os relatórios HTML/JSON ficam em `reports/lighthouse/desktop` e `reports/lighthouse/mobile`, com métricas LCP, CLS e TBT. `npm run lighthouse:summary` gera medianas e versões/ambiente em `reports/lighthouse/summary.md`.

## Limitações da entrega

O arquivo fornecido não continha fontes, recortes de arte ou frames móveis exportados separadamente; foram criados SVGs vetoriais locais e layouts responsivos inspirados na prancha. Os serviços e dados são de demonstração. Não foi configurado deploy público nem repositório remoto porque a solicitação não incluiu credenciais/conta ou destino; o código precisa ser publicado para cumprir a exigência de URL pública.
