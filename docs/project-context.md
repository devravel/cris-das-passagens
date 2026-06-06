# Projeto: Cris das Passagens

## Objetivo

Criar um website moderno premium para agência de turismo.

## Stack

- Next.js
- Tailwind CSS
- shadcn/ui
- TypeScript

## Estilo Visual

- Moderno
- Premium
- Inspirado em empresas modernas de turismo
- Muito whitespace
- Responsivo
- SEO otimizado

## Público

- Pessoas buscando passagens
- Turismo
- Viagens nacionais e internacionais

## Estrutura do site

- Navbar
- Hero
- Benefícios
- Destinos
- Serviços
- Depoimentos
- Blog preview
- CTA final
- Footer

## Requisitos

- Mobile first
- SEO friendly
- Performance otimizada
- Componentes reutilizáveis
- Design premium

## Blog

- Cards de preview na homepage
- Página separada de blogs
- SEO otimizado
- Layout moderno

## Estilo desejado

- Similar ao site referência analisado
- Inspirado em Vercel/Stripe adaptado para turismo

## Componentes necessários

- Navbar premium
- Hero moderna
- Cards de destinos
- Cards de blog
- Testimonials
- FAQ
- Footer

# Área Administrativa

O sistema deve possuir:

- Login admin
- CRUD de blogs
- CRUD de promoções
- Upload de imagens
- Publicação de posts
- Slideshow de promoções

# Banco de Dados

Utilizar:

- Supabase
- PostgreSQL
- Prisma ORM

# Módulo Especial: Rei da Copa 2026

## Objetivo

Criar uma campanha promocional sazonal chamada "Rei da Copa 2026" integrada ao site Cris das Passagens.

A campanha NÃO deve ser construída como um sistema gamificado complexo.

O objetivo é manter implementação simples, rápida, segura, intuitiva e facilmente administrável pelo cliente através do painel administrativo já existente.

---

## Conceito da Campanha

Usuários participam de uma promoção durante o período da Copa do Mundo.

Os participantes:

- Realizam cadastro na campanha
- Acumulam pontos através de ações externas
- Enviam palavras-chave divulgadas pelo cliente
- Aparecem em um ranking público

A apuração dos pontos continuará sendo feita manualmente pela equipe do cliente.

O sistema serve principalmente para:

- captar participantes
- validar participantes cadastrados
- facilitar gerenciamento
- exibir ranking público

---

## Regras de Escopo

IMPORTANTE:

Não implementar:

- sistema automático de pontuação
- sistema de missões automatizadas
- integração com Instagram
- integração com WhatsApp
- cálculo automático de ranking
- validação automática de ações sociais
- gamificação avançada
- sistema de premiação automática

Toda pontuação continuará sendo controlada manualmente pelo administrador.

---

## Cadastro da Campanha

Criar entidade própria para participantes.

Campos obrigatórios:

- Nome completo
- Telefone
- Instagram

Não solicitar:

- Email
- CPF
- Endereço
- Dados extras

Objetivo é reduzir atrito de cadastro.

---

## Área Pública da Campanha

Criar página dedicada:

/rei-da-copa

Essa página deve conter:

- Hero da campanha
- Regulamento
- Como participar
- Ranking
- Campo para envio de palavra-chave
- CTA para cadastro

Visual inspirado em:

- Copa do Mundo
- Futebol
- Viagens
- Cores verde, amarelo e dourado

Manter consistência com o design system existente.

---

## Ranking Público

O ranking será alimentado manualmente pelo administrador.

Exibir:

- Posição (#)
- Nome completo
- Instagram
- Pontuação

Exemplo:

#1 | João Silva | @joaosilva | 540 pontos

#2 | Maria Souza | @mariasouza | 480 pontos

Não calcular automaticamente.

---

## Palavra-chave

Criar área específica para envio de palavra-chave.

Antes do envio:

O sistema deve validar se o participante já está cadastrado.

Validação por:

- telefone
  ou
- Instagram

Apenas participantes cadastrados podem enviar palavras-chave.

---

## Gestão das Palavras-chave

O envio da palavra-chave não gera pontuação automática.

Ao receber:

- armazenar no banco
- registrar participante
- registrar data/hora
- registrar palavra enviada

A validação e atribuição de pontos continuará sendo manual.

---

## Administração

Criar módulo administrativo:

### Participantes

Permitir:

- listar participantes
- buscar participante
- visualizar dados
- exportar se necessário

### Ranking

Permitir:

- adicionar participante ao ranking
- alterar posição
- alterar pontuação
- remover participante

### Palavras-chave

Permitir:

- visualizar envios
- filtrar envios
- verificar participante
- validar manualmente

---

## Notificações

Preferência do projeto:

Registrar tudo no painel administrativo.

Opcional:

Enviar email informativo para equipe quando:

- novo participante se cadastrar
- nova palavra-chave for enviada

Mas o painel administrativo deve ser a fonte principal de consulta.

---

## CTA Global

Durante o período da campanha:

Substituir o CTA principal da homepage:

"Faça uma cotação agora"

por

"Rei da Copa 2026"

Esse CTA deve:

- apontar para /rei-da-copa
- ser visualmente destacado
- utilizar elementos visuais inspirados em futebol

Sugestão:

- ícone de bola
- hover animado
- verde/amarelo
- sem comprometer acessibilidade

---

## Cupons

O sistema de cupons da campanha é uma funcionalidade separada.

Não misturar lógica de cupons com:

- ranking
- palavras-chave
- participantes

Manter módulos desacoplados.

---

## Princípios Técnicos

Seguir obrigatoriamente:

- Next.js App Router
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- shadcn/ui

Prioridades:

- simplicidade
- baixo custo de manutenção
- segurança
- SEO
- responsividade
- acessibilidade

Sempre preferir soluções simples e administráveis em vez de automações complexas.
