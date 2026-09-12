# Repaginação — Cris das Passagens

Objetivo: o site está simples, sem contraste e sem vida. Este arquivo tem o
diagnóstico (feito), as decisões do dono (a preencher) e o gosto (a preencher).

---

## Estado (2026-09-12)

- **Repaginação aprovada pelo Cristian e no ar** em crisdaspassagens.com.br
  (merge `repaginacao` → `main`, commit 8cbd6d1, 2026-09-12).
- Subiu **sem** a seção de roteiros da home
  (`content.itineraries.enabled = false`). O mockup fica vivo na branch
  `roteiros`, onde nasce a funcionalidade nova — spec em `roteiros.md`.
- `repaginacao` pode ser apagada; `main` é a base daqui pra frente.

---

## Diagnóstico

### Causa raiz: o produto sumiu da home

`LANDING_PACKAGE_CATEGORY_SECTIONS_ENABLED = false` em
`config/packages-showcase.ts`. Abaixo do hero: Cadastur, depoimentos, suporte,
FAQ, blog, parceiros, CTA final, newsletter. **Oito seções, nenhuma mostra um
destino.** É uma home de prestador de serviço, não de agência de viagens.

Nenhum redesign de hero conserta isso. Enquanto a home não mostrar lugar, ela
vai continuar sem vida.

### Sintomas

1. **Hero sem imagem, e as imagens que existem são flyers.** `TourismHero` usa
   `Section background="soft"` (= `bg-muted/25`, branco). O lado esquerdo é
   texto preto sobre branco. O lado direito são os pacotes do banco, e a
   imagem de cada pacote é **a arte de divulgação pronta da Cris**: cartaz
   vertical com tipografia própria, cores próprias, logo próprio e o preço já
   queimado dentro. Ver `antes-desktop.png`.

   Consequências:
   - Os três cartazes brigam entre si e brigam com o site. Cada um tem uma
     paleta. O site não tem controle visual nenhum sobre eles
   - **O preço aparece duas vezes:** queimado no cartaz e de novo no texto do
     card ("R$ 6.480")
   - Não existe uma única fotografia de destino no site. `public/` só tem
     logo, Cadastur, QR code e parceiros
   - É por isso que a home parece barulhenta e morta ao mesmo tempo: ruído
     concentrado na direita, vazio total na esquerda
2. **Uma cor só.** `--brand #345ba7` em cinco claridades + verde do WhatsApp.
   Sem cor quente, sem acento. Azul médio sobre branco é paleta de banco.
3. **Sem hierarquia tipográfica.** `--font-heading` e `--font-sans` apontam
   ambos pro mesmo `--font-jakarta`. Plus Jakarta Sans é a fonte de template
   SaaS por excelência (a mesma armadilha do VALEMAQ, onde era Jost).
4. **Headline discreta.** `text-[2.25rem]` no mobile, `lg:text-5xl` (3rem) no
   desktop, peso 600. E "Mais que uma viagem, Um Sonho!" é copy de agência
   genérica.
5. **Ritmo quase plano.** A única seção com cor cheia é a faixa azul do
   Cadastur. O resto, do topo ao rodapé, é branco ou quase-branco. E o
   "Suporte Total" tem dois cards lado a lado, um azul-marinho e um ciano
   berrante, sem regra que explique a diferença. Contraste passa no WCAG
   (checado, nenhum texto abaixo do mínimo), o problema é de sistema: são duas
   cores escolhidas a esmo.

6. **Mobile: a primeira tela não tem viagem nenhuma.** Título, subtítulo, lista
   de serviços e um botão. Só isso. O primeiro pacote aparece depois do campo
   de cupom, e os cartazes entram cortados nas duas laterais. Ver
   `antes-mobile.png`.

7. **Dois widgets flutuantes cobrindo o produto.** O balão "Em que podemos
   ajudar?" mais o botão do WhatsApp ocupam o canto inferior direito. No
   mobile (390px) eles cobrem o carrossel de pacotes.

### Falso alarme, registrado pra não virar caça-fantasma

Um print de página inteira mostra um vazio enorme entre os depoimentos e
"Nossos parceiros". **Não é bug.** `SupportSection`, `FaqModern` e
`BlogPreviewHomeSection` são `next/dynamic` e só pintam quando entram no
viewport. Rolando a página, todas renderizam normalmente.

---

## O que difere do VALEMAQ (muda o processo)

- **Repo próprio:** `github.com/devravel/cris-das-passagens`, atualmente na
  `main`. Push na main provavelmente deploya pro site vivo da cliente.
  **Branch é obrigatório aqui**, não recomendação.
- **Conteúdo vem do banco** (Prisma + Supabase). Card de pacote não se desenha
  sem olhar dado real. E o admin (tiptap, upload de imagem) tem que continuar
  funcionando depois da repaginação.
- **Campanha ativa:** `config/rei-da-copa-campaign.ts` troca o CTA primário do
  hero. Não pode quebrar.
- **Meta Pixel instalado** (`trackMetaLeadFromHref` no hero). Se tem tráfego
  pago rodando, mexer no hero mexe em conversão medida.
- **Cliente real, site no ar** em crisdaspassagens.com.br. Precisa de aval.

---

## Decisões do dono (preencher antes de abrir o chat)

1. **Reativa as seções de pacote na home?**
   `LANDING_PACKAGE_CATEGORY_SECTIONS_ENABLED` volta pra `true`?
   Se não, o que ocupa o lugar delas?
   > resposta: não, a ideia é ter uma página para todos os pacotes e na home ficar apenas os pacotes selecionados como destaque.  

2. **O que fazer com os cartazes de divulgação?** (a decisão de design mais
   importante)
   - (a) **Separar arte de dado.** O card do site usa uma foto limpa do destino
     e o site desenha preço, datas e origem com a tipografia dele. O cartaz
     continua existindo pro Instagram e pro WhatsApp, onde ele funciona. Isso
     exige um campo de imagem novo no admin e a Cris subindo duas imagens por
     pacote
   - (b) **Manter o cartaz** e desenhar o card em volta pra emoldurar em vez de
     competir. Mais barato, teto de qualidade mais baixo
   > resposta: letra b.

3. **De onde vêm as fotos de destino?**
   - (a) a Cris manda as fotos reais dos pacotes que ela vende
   - (b) Unsplash, via `scripts/buscar-imagem.mjs` do repo da Sylvestre
   - **Não gerar destino por IA.** Vender um lugar que não existe daquele jeito
     é problema com cliente real, e o modelo grátis do repo não segura paisagem
     reconhecível.
   > resposta:

4. **A campanha Rei da Copa continua ativa?** Tem tráfego pago rodando agora?
   > resposta: não existe mais. foi uma campanha passada que não está mais ativa. código ainda existe para caso o cliente queira fazer algo parecido no futuro. 

5. **A Cris já sabe que o site vai mudar?**
   > resposta:já. não me pagará nada por isso, uma vez que o contrato não previa e o valor integral já foi pago. mas ele me permitiu realizar essas alterações, e estou fazendo principalmente para melhorar no meu portfólio, e o site ficar mais bonito. até por isso é que eu não quero fazer nada que mude demasiadamente a estrutura pesada, lógica, etc. mais a parte visual e reorganização e reestilização mesmo. 
---

## Gosto (preencher)
quero que voce adicione animacoes mais impressionantes e mais lentas, para serem realmente percebidas pelo usuario, animaccoes smooth em sua maioria animadas em blocos.  nao precisa fazer exatamente igual em todas as secoes, mas quero algo assim: Implemente uma animação de reveal premium nas seções do site baseada na referência visual fornecida.

Cada seção de duas colunas deve ter animações independentes para seus elementos. A imagem deve iniciar aproximadamente 80px deslocada para a esquerda e com opacity: 0, enquanto o bloco de conteúdo inicia aproximadamente 120px deslocado para a direita e com opacity: 0. Quando aproximadamente 25% da seção entrar na viewport, ambos devem convergir simultaneamente para suas posições naturais (translateX(0), opacity: 1).

Utilize IntersectionObserver com threshold: 0.25. A animação deve ocorrer apenas uma vez por seção e o observer deve ser removido após o primeiro disparo.

A animação deve durar aproximadamente 850ms e utilizar cubic-bezier(0.22, 1, 0.36, 1). Não anime left, right, top, margin ou outras propriedades que causem layout/reflow. Utilize somente transform e opacity.

Os elementos internos do conteúdo devem possuir um stagger sutil: eyebrow em 100ms, título em 150ms, descrição em 220ms e CTA em 300ms. Eles devem entrar com translateY(20px) + opacity 0 e terminar em translateY(0) + opacity 1.

A imagem pode utilizar opcionalmente um micro-scale de no máximo 1.02–1.03, mas não deve haver efeito de zoom perceptível.

No desktop, utilizar aproximadamente -80px para a imagem e +120px para o conteúdo. No tablet reduzir para aproximadamente -50px/+70px. No mobile, onde as colunas forem empilhadas, substituir o movimento horizontal por um movimento vertical de aproximadamente 35px.

Adicionar prefers-reduced-motion: reduce, desativando todas as transições para usuários que preferem movimento reduzido.

A animação deve ser extremamente suave, sofisticada e discreta. Não quero um slide genérico. Quero que imagem e texto pareçam entrar simultaneamente de lados opostos e se encaixar na composição final, reproduzindo a sensação da referência.

Antes de implementar, inspecione a estrutura atual do projeto e reutilize os componentes/classes existentes. Não crie uma biblioteca de animação nova se o projeto já possuir uma solução adequada. Faça a implementação de forma reutilizável para todas as seções que receberem a classe/componente de reveal.
### Referências

Estado atual registrado em `antes-desktop.png` e `antes-mobile.png`.

- obs: nao consegui achar outros sites mais modernos, mas encontrei dois que gostei de coisas específicas e quero replicar. segue abaixo urls e descricao do que gostei em cada.

 <https://assessoriavipviagens.com.br/> — gostei da hero tambem, o vídeo de fundo, talvez não quero este vídeo na mesma localização mas talvez em outro lugar do site. mas o que mais gostei mesmo é coisas relacionadas a estrutura do site tipo a secao abaixo da hero de roteiros e logo abaixo uma com cards de pacotes. também curti e quero ver se dá pra por a secao tipo embed do instagram, com os melhores posts ou apenas os recentes. quanto a secao onde esta os roteiros, abaixo da hero, como o cristian nao tem exatamente roteiros e tal, quero os pacotes em destaque ali. e posteriormente vou verificar com ele se ele deseja criar os roteiros, mas aí será algo a parte. se quiser pode adicionar abaixo dos pacotes uma secao de mockup meio que demonstração para caso eles existam depois, para mostrar para ele mais ou menos como ficaria. 
 <https://youcanflyviagens.com.br/> — gostei da background da hero, que é uma ilustração de fundo com uma foto de uma pessoa ali remetendo a algo de viagem e com a logo da marca. quero fazer algo parecido. no caso tirei print da imagem do site de referencia e tenho a foto aqui do Cristian pra adicionar aqui no site. Então adicionarei as duas no chatgpt e preciso que voce me de um prompt para criar a nova usando a foto do cristian e identidade visual dele.  

### Proibido
- (herda do VALEMAQ: sem travessão na copy, sem eyebrow em toda seção, sem fonte pequena, sem card branco com sombrinha repetido, fonte padronizada de IA).
- ...

### Não pode perder
- CTA de cotação acima da dobra
- WhatsApp
- selo Cadastur (é credibilidade regulatória, não enfeite)
- cupom (`CouponApplyForm`) e o carrossel de pacotes em destaque
- secao de pacotes em destaque na pagina home. 
