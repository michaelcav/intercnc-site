# InterCNC — prévia institucional

Site estático em português, com identidade branca, azul e amarela, animações GSAP e layout responsivo.

## Acesso local

No Laragon, abra `http://localhost/interCNCproduto/` ou o domínio virtual configurado para esta pasta. Alternativamente, execute `php -S 127.0.0.1:8080` nesta pasta e acesse `http://127.0.0.1:8080`.

## Conteúdo

- Página inicial: index.html
- Centro de usinagem: produto-itmc-650.html
- Torno CNC: produto-itb-420.html
- Fresadora: produto-itf-2242.html
- Dados dos produtos, filtros e formulário: app.js
- Layout responsivo: styles.css

As fotos e especificações foram consultadas no site oficial da InterCNC. Cada página inclui o link da ficha original. A imagem da categoria fresadora representa a linha; confirme a correspondência fotográfica e as configurações comerciais com a empresa antes da publicação definitiva. As categorias convencional e inclinado direcionam para consulta comercial, pois ainda não têm modelos individuais cadastrados.

O formulário valida os campos e abre o WhatsApp com a mensagem preenchida. O visitante conclui o envio no WhatsApp. Não há backend, envio automático de e-mail, banco de dados nem painel administrativo. Os três produtos são cadastrados no código em app.js. Não são armazenados dados do formulário neste site.

GSAP e imagens estão disponíveis localmente em assets. As fontes Barlow Condensed e Manrope são carregadas pelo Google Fonts, com alternativas de sistema.

## Verificação

`node --check app.js` verifica a sintaxe. `node qa.cjs` executa testes de navegador usando Chrome instalado no caminho padrão do Windows e o servidor local na porta 8080. Verifica imagens, filtros, menu de máquinas, páginas técnicas, seleção do modelo, mensagem de WhatsApp, menu móvel e transbordamento horizontal em desktop e celular. O teste intercepta a abertura do WhatsApp; nenhuma mensagem é enviada.

## Hero com vídeo

Hero em 100vh / 100svh, menu sobreposto com logo central, títulos Raleway e ícones Lucide (0.468.0), com arquivo local em assets/lucide.min.js. O vídeo de fundo é ilustrativo, de Daniel Smyth no Pexels: https://www.pexels.com/video/a-machine-is-cutting-metal-with-a-metal-cutting-tool-9033891/ . Não representa uma filmagem da InterCNC. Arquivo local: assets/usinagem.mp4; imagem de reserva: assets/hero-poster.jpg. Reprodução sem som, em loop, sem controle de pausa visível e com respeito à preferência por movimento reduzido.

O menu de máquinas fica em mega-menu.js: abre por hover ou clique no desktop, ocupa cerca de 50vh e filtra os modelos pelas categorias à esquerda. Inclui fechamento por Escape, botão, clique fora e saída do mouse, com navegação por teclado e adaptação ao celular. O indicador de rolagem usa o ícone Mouse do Lucide com roda animada; a animação respeita movimento reduzido.

Navegação atual: CTA de máquinas à esquerda, logo ao centro e hambúrguer animado à direita. navigation.js controla o menu preto de 100svh, com bloqueio de rolagem, navegação por teclado e fechamento por Escape. O submenu usa até quatro produtos por linha, mantendo os três modelos cadastrados. A fonte Raleway também é usada nos textos e ações.

## Vitrine por rolagem

showroom.js monta a vitrine logo abaixo do hero. O quadro ocupa 100svh e permanece fixo dentro de uma faixa de 350svh, apresentando ITMC-650, ITB-420 e ITF 2242-I antes da próxima seção. GSAP ScrollTrigger controla as transições, com retorno ao rolar para cima. Com movimento reduzido ou sem GSAP, os três modelos aparecem em sequência normal. O submenu inicia em Centro de usinagem; a categoria Todos os modelos foi removida.

## Vitrine por categorias

Os cinco botões inferiores selecionam a categoria. Centro de usinagem é a inicial e percorre ITMC-650, ITMC-800 e ITMC-1100 pela rolagem. Os modelos 800 e 1100 têm imagens oficiais e páginas individuais com especificações e fonte. Fresadora e Torno CNC Paralelo mostram seus modelos cadastrados; Convencional e Inclinado mostram consulta comercial. Trocar a categoria reinicia no primeiro modelo e recalcula a faixa de rolagem conforme a quantidade disponível. No celular, a barra de categorias tem rolagem horizontal.

## Navegação imediata da vitrine

showroom-motion.js controla transições discretas com GSAP. Cada gesto vertical da roda seleciona o próximo modelo ou o anterior, com proteção contra o embalo do touchpad. A página segue normalmente nas extremidades. Setas, teclas esquerda/direita e gestos verticais de toque também navegam os modelos. O CTA tem fundo transparente e contorno branco; a categoria ativa recebe um retângulo de borda branca animado, respeitando movimento reduzido. O fallback de movimento reduzido continua exibindo os modelos em sequência normal.

## Categorias em vídeo

category-scene.js monta a seção Qual é o seu próximo desafio?, em largura total e 100svh, com um vídeo de usinagem compartilhado pelas cinco faixas verticais. Hover expande a faixa; clique seleciona a categoria correspondente e retorna à vitrine. No celular, as faixas têm rolagem horizontal. O vídeo pausa fora da tela e respeita movimento reduzido. Foram removidos o catálogo em grade e o bloco A diferença está nos detalhes, entre a vitrine e esta seção. Sobre e Contato permanecem. Execute node qa-categories.cjs para as verificações desta seção.

## Imagens por categoria e modal

A seção de categorias usa outro vídeo, assets/categorias-usinagem.webm (aproximadamente 1,6 MB), com autoplay sem som e loop; imagem de reserva: assets/category-poster.jpg. Clipe ilustrativo gratuito de Dominik Zítka no Pexels: https://www.pexels.com/video/high-precision-cnc-machine-operation-31751330/ . Hover ou foco em uma faixa mostra a imagem correspondente; sair restaura o vídeo. O clique abre o modal nativo de category-dialog.js na categoria selecionada, mantendo a posição da página. catalog-view.js compartilha a apresentação de produtos entre o modal e o submenu. Modal com fechamento por botão, Escape ou clique fora, bloqueio de rolagem e retorno do foco. No celular, a categoria ativa é mantida visível na barra horizontal.

## Home em camadas

home-scroll.js organiza cinco etapas: headline, vitrine, categorias em vídeo, empresa e contato. Uma seção permanece fixa enquanto a seguinte sobe e a sobrepõe, com sombra e escurecimento progressivos. Roda do mouse e gestos verticais avançam entre etapas; a vitrine conserva suas transições internas por modelo. Conteúdo mais alto que a tela continua rolando antes de avançar. Formulários, modais e rolagem horizontal mantêm seus controles. Movimento reduzido restaura o fluxo normal.

As posições das etapas usam marcadores estáveis: use window.homeSectionTop(element), pois offsetTop de um elemento sticky varia durante a rolagem. window.homeScrollToSection(element) anima a navegação; window.homeCancelScroll() interrompe uma transição ao abrir menus ou escolher categorias. Execute node qa-home.cjs para verificar sobreposições, avanço/retorno, rolagem interna das máquinas, modal, toque, âncoras e movimento reduzido.

## Carrossel livre e modal arredondado

A vitrine agora ocupa apenas 100svh e não captura roda do mouse ou gestos para obrigar a visualização das máquinas: a rolagem segue para a próxima seção. Os modelos são navegados pelas setas ou teclas esquerda/direita, em loop infinito nos dois sentidos. A seta acionada recebe destaque amarelo. Não há avanço automático por temporizador.

O modal tem cantos arredondados, navegação lateral com seleção azul e seta amarela e cards arredondados. Botão de fechar, Escape e clique fora executam a saída de 280ms, incluindo rotação do ícone X; a rolagem é restaurada ao concluir. Movimento reduzido fecha imediatamente. `node qa.cjs` executa as suites atuais: carrossel/modal, categorias e navegação da home.

## Rodapé branco e landing pages de produto

A home tem três seções: headline, vitrine e categorias. Os blocos de empresa e formulário foram removidos; a faixa de vantagens também saiu com o bloco institucional. O novo rodapé branco mantém telefone, e-mail, endereço, horário e acesso ao WhatsApp. footer-markup.html é o modelo replicado nos HTMLs. site-chrome.css e site-chrome.js controlam o estilo compartilhado e o botão flutuante de voltar ao topo. Na home, #contato aponta ao rodapé; nas páginas de produto, continua apontando ao formulário.

ITMC-650 e ITMC-800 usam product-landing.js, product-landing.css e product-experience.js: abertura em destaque, navegação fixa, apresentação editorial, abas de recursos, ampliação da foto, vídeo ilustrativo, esquema da mesa, ficha técnica em acordeões, exportação CSV e cotação por WhatsApp. Cada modelo tem dimensões, capacidades, fotos e recursos correspondentes ao cadastro oficial. As demais páginas preservam sua estrutura anterior. As referências de direção visual foram BYD Dolphin Mini e Lamborghini Temerario Tettonero; o layout e os textos foram criados para a InterCNC.

node qa-landing.cjs verifica os dois produtos em desktop e celular, abas, ficha técnica, exportação, ampliação de imagem, cotação e botão flutuante.

## Atualização visual das LPs

ITMC-650 e ITMC-800 agora têm CTA transparente com contorno branco na abertura e não possuem navegação interna fixa: fica apenas o menu principal. A segunda dobra é um carrossel editorial escuro, com a foto centralizada, prévia do próximo card, setas, indicadores, teclado e arraste. Os três cards usam a foto real do equipamento e recortes ampliados da área de trabalho e do comando, sem simular novas fotografias. A seção Engenharia em números usa cinza escuro, destaques de performance e acordeões com contraste reforçado. A cotação usa um cartão claro, campos individuais e botão azul. `node qa-landing.cjs --mobile-only` verifica especificamente o encaixe e as interações em celular.

Capacidade e recursos agora formam uma única seção branca, com apresentação editorial, esquema da mesa e quatro recursos. A seção Continue explorando foi removida. Os três indicadores da headline ficam imediatamente acima do CTA. `node qa-landing.cjs --layout-only` verifica essas mudanças nos dois modelos em desktop e celular.

## Performance e revisão mobile

Os indicadores da abertura têm números e legendas maiores. As entradas dos blocos de capacidade, recursos, destaques técnicos e formulário receberam transições leves; a preferência por movimento reduzido é respeitada. Campos mobile usam 16px para evitar o zoom automático no preenchimento no iPhone, e os controles da galeria têm áreas de toque maiores.

As sete fotos de máquinas têm variantes WebP de 480 e 800px, selecionadas por `srcset` e `sizes`, com decodificação assíncrona. Os originais permanecem disponíveis. Os arquivos de 480px têm entre 16 e 29KB. A abertura usa MP4 H.264 sem áudio, com início rápido: aproximadamente 650KB no celular e 1,68MB no desktop, comparados aos 5,7MB do original. O vídeo de categorias possui alternativa MP4 de aproximadamente 805KB. Vídeos abaixo da dobra são carregados ao entrar na tela; todos pausam fora da tela ou quando a aba fica oculta. Os pôsteres foram comprimidos e as fontes passaram a ser descobertas diretamente no HTML, com preconnect e font-display swap.

`media-performance.js` controla o carregamento e a pausa dos vídeos. Para reproduzir os assets, instale `pillow` e `imageio-ffmpeg` em `.tools-media` (`python -m pip install --target .tools-media pillow imageio-ffmpeg`) e execute `python optimize-media.py`.

Validação: `node qa.cjs` passou para home, carrosséis, categorias, modais, abas, CSV, cotação e navegação. `node qa-mobile-performance.cjs` passou em perfis Android e iPhone emulados no Chromium, incluindo retrato, paisagem, campos, mídia adiada e ausência de erros JavaScript não tratados. `node qa-landing.cjs --layout-only` passou nos dois modelos em desktop e celular. A emulação de iPhone não executa Safari/WebKit: testes em dispositivos físicos Android e iOS ainda são necessários para confirmar o comportamento nesses ambientes. Não foi atribuída pontuação Lighthouse.
