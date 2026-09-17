# Roteiros — funcionalidade nova (anotada 2026-09-12)

## Estado (2026-09-17)

- **Primeira versão pronta na branch `roteiros`**: banco (migração
  `20260916120000_add_itineraries`), `/roteiros`, `/roteiros/[slug]`, seção
  de destaques na home (some sozinha sem destaque), aba `/admin/roteiros`
  com divisórias (criar, renomear, reordenar, excluir), lista, criar/editar
  com preview em tempo real. Testado no navegador: criar, editar, destaque.
- Dois roteiros de exemplo no banco (Caldas Novas, cópia da referência, e
  Gramado e Canela) pra demonstrar ao Cristian. Apagar pelo admin depois.
- Imagens de roteiro vão pro bucket `blog-covers`, pasta `itineraries/`
  (reuso do upload do blog, sem bucket novo). Imagem inline do tiptap cai
  em `content/`, como no blog.
- Formulário de reserva da referência virou bloco que monta a mensagem do
  WhatsApp (hotel, saída, adultos/crianças/bebês). Sem envio ao servidor.
- Descrição é texto simples; as 8 abas e a descrição de hotel são tiptap.
- **v1.1 (2026-09-17, tarde)** com as referências extras e a conversa com
  o Cristian: faixa "O roteiro inclui" com ícones (lista fixa em
  `lib/itinerary/included-items.ts`, marcada no admin), vídeo do YouTube e
  mapa do Google (campos opcionais, aceitam link normal), abas em blocos
  lado a lado (Schultz) com texto livre do editor, justificado, títulos de seção com linha dos dois lados (infotravel), e no bloco de
  reserva: data aproximada, mensagem e os produtos à parte "Guia virtual" e
  "Roteiro personalizado" (`content.itineraries.extras`) — tudo vai na
  mensagem do WhatsApp.
- Próximo: mostrar ao Cristian, cortar/ajustar, aí merge na `main`.

Aprovada pelo Cristian. Referência de estrutura (ele aprovou copiar bem
parecido): assessoriavipviagens.com.br. **Entra depois** da entrega da
repaginação (quinta, 2026-09-17) — ver "Branches" no fim.

## O que é

Roteiro = viagem pronta com itinerário, o que inclui, saídas etc. Diferente
de pacote (`Package`), que hoje é o cartaz de divulgação com preço. Os dois
convivem: pacotes continuam como estão, roteiros são um catálogo novo.

## Fluxo, do público ao admin

1. **Home** — seção "Roteiros em destaque" no lugar do mockup atual
   (`ItinerariesSection`, `config/content.ts → itineraries`). Mostra só os
   roteiros marcados como destaque no admin. Some o conteúdo estático.
2. **`/roteiros`** — página de todos os roteiros, agrupados por categoria
   (as "divisórias"). Estrutura idêntica à referência
   <https://assessoriavipviagens.com.br/viagens/>.
3. **`/roteiros/[slug]`** — página de cada roteiro. Estrutura idêntica à
   referência <https://assessoriavipviagens.com.br/viagens/viagens_detalhes.asp?id=83>.
4. **`/admin/roteiros`** — aba nova no painel, no molde da aba de blog:
   lista de roteiros ativos, marca de destaque, editar, criar novo.

## Referência — página de listagem (`/viagens/`)

Analisado em 2026-09-12:

- Título "Todos os roteiros". Sem hero, sem filtro, sem dropdown.
- Uma seção por categoria, em sequência, cada uma com o nome da categoria
  como título e um grid de cards. Categorias da referência (ordem real):
  Em destaque, Promoções, Pacotes nacionais, Pacotes internacionais,
  Cruzeiros, Hotéis e resorts, Semana da criança, Férias de julho, Lua de
  mel, Ecoturismo e aventura, Baixa temporada, Férias de janeiro,
  Rodoviários, Semana santa, Feriados.
- **Um roteiro pode estar em várias categorias** (o mesmo "Porto de
  Galinhas" aparece em Nacionais, Semana da criança, Lua de mel, Baixa
  temporada e Férias de janeiro). Relação N:N, não campo único.
- Card: imagem (capa), título, duração ("08 dias e 07 noites"), botão
  "Roteiro". **Sem preço, sem origem, sem badge** no card.
- WhatsApp flutuante. Botão "Voltar" antes do rodapé.

## Referência — página do roteiro (`viagens_detalhes.asp?id=83`)

Copiar **todos** os blocos abaixo, mesmo conteúdo, no visual do Cris.
Cortar depois se ele quiser. Ordem real, de cima pra baixo:

1. **Título** do roteiro (caixa alta na referência).
2. **Linha de duração e preço**: "Duração: 06 horas e 04 noites - A partir
   de: Consulte*". Preço é texto livre (pode ser "Consulte").
3. **Galeria**: fileira de miniaturas (8 na referência) que abrem em
   lightbox + uma imagem grande com o título sobreposto.
4. **Descrição**: parágrafo(s) de apresentação do destino.
5. **Abas/acordeão** com 7 seções, cada uma expandível:
   - **Roteiro** — texto corrido do itinerário + subtítulo "Opcionais" com
     lista de itens
   - **Inclui** — texto + lista
   - **Não inclui** — texto/lista
   - **Pagamento** — lista de condições ("Em até 5x sem juros no cartão",
     "3% desconto à vista"...)
   - **Saídas** — lista de datas/períodos ("01/02 a 06/02")
   - **Seguro** — texto
   - **Observações** — texto ("Valores por pessoa em apto duplo...")
6. **"Escolha o hotel de sua preferência"** — lista de cards de hotel, cada
   um com: foto, nome, tabela de detalhes (Tipo, Acomodação, Diárias com,
   Site), tabela de preços por pessoa (Single, Duplo, Triplo, Quádruplo,
   Quíntuplo, Crianças ×2) e texto descritivo longo. **Opcional por
   roteiro** (o Cristian decide em cada um se põe hotel ou não).
7. **Disclaimer**: "* Valores sujeitos a alteração sem aviso prévio.
   Pacotes sujeitos a disponibilidade e a alterações. Fotos meramente
   ilustrativas."
8. **Formulário "Informações e reservas"**: dropdown de hotel/tarifa,
   UF, adultos (1–7), crianças (0–7), bebês (0–7), checkbox de privacidade,
   botão "Enviar formulário!".
   > **Decidir com o Cristian:** o site dele não tem formulário nenhum de
   > propósito (tudo vai pro WhatsApp, política de privacidade escrita em
   > cima disso). Proposta: manter os mesmos campos mas o botão monta a
   > mensagem do WhatsApp com hotel + quantidade de pessoas pré-preenchidos,
   > sem mandar nada pro servidor. Se ele quiser formulário de verdade,
   > entra Resend (já existe pro Rei da Copa) e a política precisa ser
   > atualizada.
9. WhatsApp flutuante (já existe no site).

## Admin — `/admin/roteiros`

Modelo: aba de blog (`app/admin/(protected)/blogs`, `lib/blog`). Reusar
tiptap, upload pro Supabase Storage (bucket novo `itinerary-images`),
server actions com `revalidatePath`.

**Lista**: todos os roteiros, com status (ativo/rascunho), marca de
destaque (aparece na home), categorias, editar. Mesmo padrão da lista de
posts.

**Categorias ("divisórias")**: gerenciadas pelo Cristian, não fixas no
código. Botão "Adicionar divisória" cria uma categoria; ele cria quantas
quiser, reordena, renomeia, remove. Cada roteiro recebe uma ou mais
categorias (N:N, ver referência) e aparece em cada seção correspondente em
`/roteiros`. Categoria sem roteiro ativo não renderiza na página pública.

**Criar/editar roteiro** — uma tela só, campos em blocos na ordem da
página pública, e no fim **preview em tempo real** de como fica no site +
botão de criar/salvar.

Campos (obrigatório / opcional):

| Campo | Obrig. | Tipo |
|---|---|---|
| Título | sim | texto |
| Slug | sim | gerado do título, editável |
| Capa (card + imagem grande) | sim | upload |
| Galeria | não | vários uploads, ordenáveis |
| Duração | sim | texto livre ("08 dias e 07 noites") |
| Preço "a partir de" | não | texto livre; vazio = "Consulte" |
| Descrição | sim | rich text |
| Categorias | sim (≥1) | multi-select das divisórias |
| Destaque na home | não | toggle |
| Ativo/publicado | — | toggle, começa rascunho |
| Roteiro (itinerário) | sim | rich text |
| Opcionais | não | lista |
| Inclui | não | rich text/lista |
| Não inclui | não | rich text/lista |
| Pagamento | não | lista |
| Saídas | não | lista de períodos |
| Seguro | não | texto |
| Observações | não | texto |
| Hotéis | não | lista repetível (foto, nome, tipo, acomodação, diárias com, site, tabela de preços, descrição) |

Bloco vazio não aparece na página pública (aba some, seção de hotel some).
Personalizável: ele pode montar um roteiro só com texto, ou cheio de
imagem — os blocos ricos aceitam imagem inline pelo tiptap.

## Visual

Identidade do Cris (paleta, tipografia, componentes da repaginação), mas
**posicionamento igual à referência**: onde tem imagem, onde tem
acordeão, onde tem capa, ordem dos blocos. Não inventar layout novo.

## Banco (rascunho, fechar na hora de implementar)

`Itinerary` (título, slug, capa, galeria[], duração, preço texto, descrição,
blocos de texto acima, published, featuredOnHomepage, ordem),
`ItineraryCategory` (nome, slug, ordem), `ItineraryCategoryLink` (N:N),
`ItineraryHotel` (1:N com o roteiro, campos da tabela acima). Migração
Prisma nova; `sitemap.ts` ganha `/roteiros` e os slugs.

## Branches

- `repaginacao` → entrega de quinta. `content.itineraries.enabled = false`
  (mockup de roteiros **fora** da home). Vira `main` após aprovação.
- `roteiros` → criada a partir da `repaginacao` com o mockup ainda ligado.
  A funcionalidade inteira nasce aqui. Rebase em `main` depois que a
  repaginação subir.
