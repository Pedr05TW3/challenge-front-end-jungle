# Histórico de alterações

Este arquivo resume as mudanças realizadas no projeto durante sua implementação.

## Marketplace NFT

- Criada a aplicação KURIO em React, TypeScript e Vite, com layout responsivo para desktop, tablet e celular.
- Adicionadas rotas para catálogo, detalhe da NFT, carrinho, checkout, recibo de pedido, autenticação, perfil e carteiras.
- Implementados busca, filtros, ordenação, paginação, favoritos, carrinho, cupons e fluxo de compra simulada.
- Integrados TanStack Router e TanStack Query para navegação, cache, estados de carregamento e atualização de dados.
- Criada camada Axios e API simulada com MSW para catálogo, sessão, carrinho, cotação, pedidos, perfil e carteiras.
- Adicionada atualização simulada de preço e disponibilidade via Socket.IO, com controle de versões dos eventos.
- Implementados pedidos simulados com cotação versionada, verificação de estoque e chave de idempotência.
- Adicionadas ilustrações SVG locais para itens sem arte fornecida.

## Artes fornecidas e identidade visual

- Integradas as quatro imagens de NFT fornecidas: Emerald Ape, Violet Ape, Night Walker e Golden Spirit.
- Convertidas as imagens para JPEG otimizado para reduzir o peso dos recursos.
- Configurada a seleção de arte por família do nome da NFT, mantendo a mesma imagem entre IDs diferentes da mesma família.
- Moss Traveler, Solar Dream, Cosmic Bloom, Jungle Echo, Amber Nomad, Quiet Orbit e Lilac Voyager recebem uma das quatro fotos por seleção pseudoaleatória estável baseada no nome-base.
- Ajustado o enquadramento quadrado das artes no destaque e na página de detalhe.
- Adicionada Roboto Mono Regular (400) como fonte local da interface.

## Área do colecionador

- Organizada a navegação da conta em abas: Dados do perfil, Carteiras, Atividade, Lista de interesse, Ofertas, Arquivos baixados e Suporte.
- Reorganizado o formulário de carteiras para incluir os campos da referência visual e persistir os dados disponíveis no mock.
- Adicionados estados vazios para seções sem dados simulados.

## Qualidade e documentação

- Criados cenários Playwright para os fluxos principais e capturas visuais nas larguras desktop, tablet e celular.
- Atualizadas as capturas visuais após as alterações de imagens e interface.
- Configuradas auditorias Lighthouse desktop e mobile com relatório de métricas.
- Adicionados README e notas de arquitetura com comandos, contratos simulados e limitações conhecidas.
- Validado o build de produção, lint, TypeScript e os 30 cenários Playwright.

## Limitações conhecidas

- API, contas, carteiras e pagamentos são simulados no navegador; não há transações reais.
- Atividade, ofertas, downloads e suporte apresentam estados de interface, mas ainda não têm endpoints ou dados completos.
- Não foi configurado repositório remoto nem publicação pública.
