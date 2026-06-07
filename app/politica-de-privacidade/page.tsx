import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { Section } from "@/components/layout/section";
import { brandPageBreadcrumbs } from "@/config/navigation";
import { bodyTextClassName } from "@/components/layout/section-header";
import { content, contentLinks } from "@/config/content";
import { createMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

const LAST_UPDATED = "7 de junho de 2026";

export const metadata: Metadata = createMetadata({
  title: "Política de Privacidade",
  description:
    "Saiba como a Cris das Passagens coleta, usa e protege seus dados pessoais. Informações sobre cookies, Meta Pixel, WhatsApp, campanha Rei da Copa e seus direitos na LGPD.",
  path: "/politica-de-privacidade",
  keywords: [
    "política de privacidade",
    "LGPD",
    "proteção de dados",
    "Cris das Passagens",
    "cookies",
    "Meta Pixel",
  ],
});

type PolicySectionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
};

function PolicySection({ id, title, children }: PolicySectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
      <h2
        id={`${id}-heading`}
        className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
      >
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function PolicyParagraph({ children }: { children: React.ReactNode }) {
  return <p className={bodyTextClassName}>{children}</p>;
}

function PolicyList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className={cn(bodyTextClassName, "list-disc space-y-2 pl-5")}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export default function PoliticaDePrivacidadePage() {
  const { contact } = content;

  return (
    <Section
      spacing="page"
      background="default"
      bordered
      aria-labelledby="privacidade-page-heading"
    >
      <PageBreadcrumb items={brandPageBreadcrumbs.politicaDePrivacidade} />

      <header className="mx-auto mb-10 max-w-3xl space-y-3 text-center sm:mb-12">
        <h1
          id="privacidade-page-heading"
          className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.5rem] md:leading-tight"
        >
          Política de Privacidade
        </h1>
        <p className={cn(bodyTextClassName, "text-center text-muted-foreground")}>
          Última atualização: {LAST_UPDATED}
        </p>
      </header>

      <Container size="narrow" padding="none" className="space-y-10 sm:space-y-12">
        <PolicyParagraph>
          Esta Política de Privacidade descreve como a{" "}
          <strong>{contact.legalName}</strong> (CNPJ {contact.cnpj}), operadora do
          site <strong>Cris das Passagens</strong>, trata dados pessoais quando você
          navega em nosso site, utiliza nossos canais de contato ou participa de
          campanhas promocionais. O texto reflete o funcionamento real do sistema em
          vigor nesta data.
        </PolicyParagraph>

        <PolicySection id="controlador" title="1. Quem somos (controlador)">
          <PolicyParagraph>
            <strong>Controlador dos dados:</strong> {contact.legalName}
          </PolicyParagraph>
          <PolicyParagraph>
            <strong>Endereço:</strong> {contact.formattedAddress}
          </PolicyParagraph>
          <PolicyParagraph>
            <strong>Telefone:</strong>{" "}
            <a href={contact.phoneHref} className="text-brand-navy underline-offset-2 hover:underline">
              {contact.phone}
            </a>
          </PolicyParagraph>
          <PolicyParagraph>
            <strong>E-mail para privacidade e LGPD:</strong>{" "}
            <a
              href={contact.emailHref}
              className="text-brand-navy underline-offset-2 hover:underline"
            >
              {contact.email}
            </a>
          </PolicyParagraph>
        </PolicySection>

        <PolicySection id="dados-coletados" title="2. Dados que coletamos">
          <PolicyParagraph>
            Coletamos apenas os dados necessários para as funcionalidades descritas
            abaixo. O site <strong>não possui formulário de contato com envio de
            dados ao servidor</strong> — a página de contato exibe informações da
            empresa e direciona você ao WhatsApp.
          </PolicyParagraph>

          <h3 className="font-heading text-lg font-semibold text-foreground">
            2.1 Cotação e atendimento via WhatsApp
          </h3>
          <PolicyParagraph>
            Quando você clica em links de cotação ou WhatsApp no site, é redirecionado
            para o aplicativo WhatsApp ({contentLinks.whatsapp}). O site pode
            pré-preencher uma mensagem (por exemplo, interesse em um pacote ou
            solicitação de cotação). Nenhum dado pessoal seu é enviado
            automaticamente ao nosso servidor nesse fluxo — a conversa ocorre
            diretamente no WhatsApp, onde você decide quais informações compartilhar.
          </PolicyParagraph>
          <PolicyParagraph>
            Se você tiver aplicado um cupom de desconto no site, o nome e o valor do
            cupom podem ser incluídos na mensagem pré-preenchida enviada ao WhatsApp,
            com base em dados armazenados localmente no seu navegador (veja seção 5).
          </PolicyParagraph>

          <h3 className="font-heading text-lg font-semibold text-foreground">
            2.2 Campanha Rei da Copa
          </h3>
          <PolicyParagraph>
            Na campanha promocional Rei da Copa, coletamos e armazenamos em nosso
            banco de dados:
          </PolicyParagraph>
          <PolicyList
            items={[
              <>
                <strong>Nome completo</strong> — no cadastro de participante;
              </>,
              <>
                <strong>Telefone celular</strong> (formato brasileiro) — no cadastro e
                para identificar participantes no envio da palavra-chave diária;
              </>,
              <>
                <strong>Usuário do Instagram</strong> — no cadastro de participante;
              </>,
              <>
                <strong>Palavra-chave enviada</strong> — texto da resposta diária da
                campanha, vinculado ao participante.
              </>,
            ]}
          />
          <PolicyParagraph>
            Após o cadastro, exibimos apenas o <strong>número de inscrição</strong> —
            o telefone não é devolvido na resposta pública da API. O ranking público da
            campanha exibe <strong>nome, usuário do Instagram e pontuação</strong>, sem
            telefone.
          </PolicyParagraph>

          <h3 className="font-heading text-lg font-semibold text-foreground">
            2.3 Curtidas no blog
          </h3>
          <PolicyParagraph>
            Ao curtir um post do blog, geramos um identificador aleatório (UUID)
            armazenado no <code className="text-sm">localStorage</code> do seu
            navegador e no banco de dados, para contabilizar curtidas sem exigir
            cadastro. Esse identificador é pseudônimo e não está vinculado ao seu nome,
            e-mail ou telefone.
          </PolicyParagraph>

          <h3 className="font-heading text-lg font-semibold text-foreground">
            2.4 Cupons de desconto
          </h3>
          <PolicyParagraph>
            Ao validar um cupom, o site armazena no{" "}
            <code className="text-sm">localStorage</code> do seu navegador apenas o{" "}
            <strong>código, nome e descrição do desconto</strong> do cupom — sem dados
            que identifiquem você pessoalmente.
          </PolicyParagraph>

          <h3 className="font-heading text-lg font-semibold text-foreground">
            2.5 Área administrativa
          </h3>
          <PolicyParagraph>
            O painel administrativo é restrito à equipe interna. No login, coletamos{" "}
            <strong>e-mail</strong> e <strong>senha</strong> (a senha é verificada e
            armazenada apenas como hash criptográfico; a senha em texto claro não é
            guardada).
          </PolicyParagraph>

          <h3 className="font-heading text-lg font-semibold text-foreground">
            2.6 Dados técnicos e de navegação
          </h3>
          <PolicyParagraph>
            Para segurança e prevenção de abuso, podemos processar temporariamente o{" "}
            <strong>endereço IP</strong> em memória do servidor ao limitar tentativas de
            inscrição na campanha (3 tentativas a cada 30 minutos), envio de
            palavra-chave (10 tentativas a cada 30 minutos) e login administrativo (5
            tentativas falhas a cada 15 minutos). O IP não é gravado em nosso banco de
            dados.
          </PolicyParagraph>
          <PolicyParagraph>
            Erros técnicos podem ser registrados em logs do servidor (por exemplo, via{" "}
            <code className="text-sm">console.error</code>), cuja retenção depende da
            plataforma de hospedagem.
          </PolicyParagraph>
        </PolicySection>

        <PolicySection id="finalidades" title="3. Finalidades do tratamento">
          <PolicyList
            items={[
              <>
                <strong>Atendimento e cotação</strong> — direcionar você ao WhatsApp
                para solicitar passagens, pacotes e hospedagem;
              </>,
              <>
                <strong>Campanha Rei da Copa</strong> — gerenciar inscrições, validar
                palavras-chave diárias, calcular ranking e comunicar prêmios conforme
                regulamento da campanha;
              </>,
              <>
                <strong>Notificações internas</strong> — avisar a equipe sobre novas
                inscrições na campanha por e-mail;
              </>,
              <>
                <strong>Interação no blog</strong> — permitir curtidas em posts sem
                cadastro;
              </>,
              <>
                <strong>Cupons</strong> — validar códigos promocionais e lembrar o
                cupom aplicado durante sua navegação;
              </>,
              <>
                <strong>Administração do site</strong> — gestão de conteúdo (pacotes,
                blog, cupons, campanha) por usuários autorizados;
              </>,
              <>
                <strong>Segurança</strong> — limitar abusos em formulários e login
                administrativo;
              </>,
              <>
                <strong>Marketing e métricas</strong> — medir visitas e conversões via
                Meta Pixel (quando configurado), conforme seção 6.
              </>,
            ]}
          />
        </PolicySection>

        <PolicySection id="base-legal" title="4. Base legal (LGPD)">
          <PolicyList
            items={[
              <>
                <strong>Consentimento</strong> — cadastro voluntário na campanha Rei da
                Copa; cookies de marketing e analytics (Meta Pixel e futuras
                ferramentas), mediante escolha no banner ou preferências de cookies;
              </>,
              <>
                <strong>Execução de procedimentos preliminares a contrato / legítimo
                interesse</strong> — atendimento via WhatsApp quando você inicia o
                contato; aplicação de cupons; curtidas no blog;
              </>,
              <>
                <strong>Legítimo interesse</strong> — segurança (rate limiting),
                notificações internas da equipe sobre inscrições na campanha,
                métricas de desempenho do site;
              </>,
              <>
                <strong>Cumprimento de obrigação legal</strong> — quando exigido por
                lei ou autoridade competente.
              </>,
            ]}
          />
        </PolicySection>

        <PolicySection id="armazenamento" title="5. Onde e por quanto tempo guardamos">
          <PolicyList
            items={[
              <>
                <strong>Banco de dados PostgreSQL (Supabase)</strong> — participantes e
                envios da campanha Rei da Copa, curtidas do blog, cupons utilizados
                (sem identificação do usuário), credenciais administrativas;
              </>,
              <>
                <strong>Supabase Storage</strong> — imagens de pacotes, blog e
                promoções enviadas pela equipe administrativa (sem upload público de
                arquivos por visitantes);
              </>,
              <>
                <strong>localStorage do navegador</strong> — cupom aplicado (expira
                após 24 horas), identificador de curtidas e preferência de posts
                curtidos;
              </>,
              <>
                <strong>Cookie de sessão administrativa</strong> (
                <code className="text-sm">admin_session</code>) — válido por 8 horas
                após o login, apenas para usuários da equipe;
              </>,
              <>
                <strong>Retenção da campanha Rei da Copa</strong> — os dados de
                participantes permanecem no banco até exclusão manual pela equipe ou
                conforme regulamento da campanha; não há exclusão automática
                programada no sistema;
              </>,
              <>
                <strong>Logs de servidor</strong> — retenção definida pela plataforma
                de hospedagem (Vercel), não pelo aplicativo.
              </>,
            ]}
          />
        </PolicySection>

        <PolicySection id="cookies" title="6. Cookies e tecnologias similares">
          <PolicyParagraph>
            Utilizamos cookies e armazenamento local conforme descrito abaixo.
          </PolicyParagraph>

          <h3 className="font-heading text-lg font-semibold text-foreground">
            6.1 Cookies essenciais (administração)
          </h3>
          <PolicyParagraph>
            O cookie <code className="text-sm">admin_session</code> é utilizado
            exclusivamente na área <code className="text-sm">/admin</code> para manter
            a sessão de usuários administrativos. É httpOnly, com validade de 8 horas,
            e não é acessível por scripts da página pública.
          </PolicyParagraph>

          <h3 className="font-heading text-lg font-semibold text-foreground">
            6.2 localStorage (visitantes)
          </h3>
          <PolicyList
            items={[
              "Cupom aplicado — código, nome e descrição do desconto (24 horas);",
              "Identificador de curtidas no blog — UUID aleatório;",
              "Registro de posts curtidos — preferência local;",
              "Preferências de consentimento de cookies — categorias aceitas ou recusadas.",
            ]}
          />

          <h3 className="font-heading text-lg font-semibold text-foreground">
            6.3 Meta Pixel (Facebook)
          </h3>
          <PolicyParagraph>
            Quando a variável de ambiente{" "}
            <code className="text-sm">NEXT_PUBLIC_META_PIXEL_ID</code> está
            configurada, carregamos o script do Meta Pixel (Facebook) em páginas
            públicas — <strong>exceto</strong> na área administrativa (
            <code className="text-sm">/admin</code>).
          </PolicyParagraph>
          <PolicyParagraph>
            Eventos enviados ao Meta incluem:
          </PolicyParagraph>
          <PolicyList
            items={[
              <>
                <strong>PageView</strong> — a cada navegação entre páginas;
              </>,
              <>
                <strong>Lead</strong> — ao clicar em links de WhatsApp ou cotação;
              </>,
              <>
                <strong>ViewContent</strong> — ao visualizar cards de pacotes em
                destaque.
              </>,
            ]}
          />
          <PolicyParagraph>
            Não enviamos nome, e-mail ou telefone nos parâmetros desses eventos. O
            Meta pode, contudo, coletar automaticamente dados como endereço IP,
            identificadores de dispositivo, cookies próprios e URL das páginas
            visitadas, conforme suas políticas.
          </PolicyParagraph>
          <PolicyParagraph>
            O Meta Pixel só é carregado após você <strong>aceitar cookies de
            marketing</strong> no banner de consentimento ou nas preferências de
            cookies (link no rodapé). Antes dessa escolha, nenhum script do Meta é
            executado e nenhum evento é enviado.
          </PolicyParagraph>
          <PolicyParagraph>
            Você pode aceitar todos os cookies, recusar os opcionais ou configurar
            categorias separadas (necessários, analytics e marketing). Sua escolha
            é salva no <code className="text-sm">localStorage</code> do navegador
            (chave <code className="text-sm">cris-consent-preferences</code>) e
            pode ser alterada a qualquer momento em &quot;Preferências de
            cookies&quot; no rodapé.
          </PolicyParagraph>

          <h3 className="font-heading text-lg font-semibold text-foreground">
            6.4 Widget de avaliações (Elfsight)
          </h3>
          <PolicyParagraph>
            Na página inicial, podemos exibir avaliações do Google por meio do
            widget Elfsight. O script da plataforma só é carregado após você{" "}
            <strong>aceitar cookies de analytics</strong>. Sem esse consentimento,
            exibimos depoimentos estáticos sem executar scripts de terceiros.
          </PolicyParagraph>

          <h3 className="font-heading text-lg font-semibold text-foreground">
            6.5 Banner e preferências de cookies
          </h3>
          <PolicyParagraph>
            Na primeira visita, exibimos um banner solicitando sua escolha sobre
            cookies opcionais. As categorias disponíveis são:{" "}
            <strong>necessários</strong> (sempre ativos),{" "}
            <strong>analytics</strong> (widget Elfsight de avaliações do Google e,
            no futuro, ferramentas de métricas) e <strong>marketing</strong> (Meta
            Pixel). O link &quot;Preferências de cookies&quot; no rodapé permite
            revisar ou alterar sua escolha a qualquer momento.
          </PolicyParagraph>
        </PolicySection>

        <PolicySection id="compartilhamento" title="7. Compartilhamento com terceiros">
          <PolicyParagraph>
            Compartilhamos dados apenas nas situações abaixo, sempre no limite
            necessário:
          </PolicyParagraph>
          <PolicyList
            items={[
              <>
                <strong>Meta Platforms (Meta Pixel)</strong> — dados de navegação e
                eventos de conversão no navegador, quando o pixel está ativo;
              </>,
              <>
                <strong>Elfsight</strong> — exibição de avaliações do Google na
                página inicial, quando cookies de analytics são aceitos;
              </>,
              <>
                <strong>WhatsApp / Meta</strong> — mensagens que você envia
                voluntariamente ao nosso número comercial após clicar nos links do site;
              </>,
              <>
                <strong>Resend</strong> — envio de e-mail interno à equipe (
                reidacopacrisdaspassagens@gmail.com) com dados de novas inscrições na
                campanha Rei da Copa (nome, telefone, Instagram, número de inscrição);
              </>,
              <>
                <strong>Supabase</strong> — hospedagem do banco de dados PostgreSQL e
                armazenamento de imagens administrativas;
              </>,
              <>
                <strong>Vercel</strong> — hospedagem e execução do site (pode processar
                logs de requisição, incluindo IP);
              </>,
              <>
                <strong>Google Places API</strong> — consulta de fotos da galeria de
                destinos com nome comercial e cidade da empresa;{" "}
                <strong>não enviamos dados pessoais de visitantes</strong> a esse
                serviço;
              </>,
              <>
                <strong>Instagram</strong> — links externos para o perfil{" "}
                @crisdaspassagens; nenhum dado é transmitido automaticamente ao
                acessar esses links.
              </>,
            ]}
          />
          <PolicyParagraph>
            <strong>Não vendemos</strong> seus dados pessoais.
          </PolicyParagraph>
        </PolicySection>

        <PolicySection id="whatsapp" title="8. WhatsApp">
          <PolicyParagraph>
            O WhatsApp é nosso principal canal de atendimento e cotação. Ao utilizar
            links do site, você é direcionado ao aplicativo WhatsApp (número{" "}
            {contact.phone}). Toda comunicação — incluindo dados que você compartilha
            voluntariamente (nome, destino, datas, documentos) — ocorre na plataforma
            WhatsApp, regida pelas políticas da Meta/WhatsApp.
          </PolicyParagraph>
          <PolicyParagraph>
            O site registra cliques em links de WhatsApp como eventos{" "}
            <strong>Lead</strong> no Meta Pixel (quando ativo), sem incluir o conteúdo
            da sua mensagem.
          </PolicyParagraph>
        </PolicySection>

        <PolicySection id="formularios" title="9. Formulários do site">
          <PolicyParagraph>
            <strong>Contato e cotação:</strong> não há envio de formulário ao servidor.
            A página de contato e os botões de cotação redirecionam ao WhatsApp.
          </PolicyParagraph>
          <PolicyParagraph>
            <strong>Campanha Rei da Copa — inscrição:</strong> formulário com nome,
            telefone e Instagram; dados validados e armazenados em PostgreSQL; limite de
            3 tentativas por IP a cada 30 minutos.
          </PolicyParagraph>
          <PolicyParagraph>
            <strong>Campanha Rei da Copa — palavra-chave:</strong> formulário com
            telefone e palavra-chave; o telefone é usado para localizar o participante
            cadastrado e não é armazenado novamente no registro da palavra-chave.
          </PolicyParagraph>
          <PolicyParagraph>
            <strong>Cupom:</strong> envio apenas do código do cupom para validação; sem
            dados pessoais.
          </PolicyParagraph>
        </PolicySection>

        <PolicySection id="rei-da-copa" title="10. Campanha Rei da Copa">
          <PolicyParagraph>
            A campanha promocional Rei da Copa possui regulamento próprio, configurável
            pela equipe no painel administrativo. Além dos dados de cadastro (seção
            2.2), tratamos:
          </PolicyParagraph>
          <PolicyList
            items={[
              "Status das palavras-chave enviadas (pendente, aprovada ou rejeitada);",
              "Pontuação e posição no ranking público (nome e Instagram visíveis);",
              "Exportação de inscrições pela equipe administrativa (dados completos, incluindo telefone).",
            ]}
          />
          <PolicyParagraph>
            A equipe recebe e-mail automático via Resend a cada nova inscrição, com
            todos os dados cadastrais informados.
          </PolicyParagraph>
        </PolicySection>

        <PolicySection id="seguranca" title="11. Segurança">
          <PolicyList
            items={[
              "Sessões administrativas protegidas por JWT em cookie httpOnly;",
              "Senhas administrativas armazenadas com hash bcrypt;",
              "Área /admin protegida por middleware de autenticação;",
              "Rotas /admin e /api bloqueadas para indexação em robots.txt;",
              "Rate limiting em inscrições, palavras-chave e login administrativo;",
              "Chaves secretas (JWT, service role, Resend, Google Places) utilizadas apenas no servidor, nunca expostas ao navegador.",
            ]}
          />
        </PolicySection>

        <PolicySection id="direitos" title="12. Seus direitos (titular dos dados)">
          <PolicyParagraph>
            Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você
            pode solicitar:
          </PolicyParagraph>
          <PolicyList
            items={[
              "Confirmação da existência de tratamento;",
              "Acesso aos seus dados;",
              "Correção de dados incompletos, inexatos ou desatualizados;",
              "Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;",
              "Portabilidade, quando aplicável;",
              "Eliminação dos dados tratados com base no consentimento;",
              "Informação sobre compartilhamentos;",
              "Revogação do consentimento (incluindo cookies de marketing e analytics via preferências no rodapé).",
            ]}
          />
          <PolicyParagraph>
            Para exercer seus direitos, envie e-mail para{" "}
            <a
              href={contact.emailHref}
              className="text-brand-navy underline-offset-2 hover:underline"
            >
              {contact.email}
            </a>{" "}
            com o assunto &quot;LGPD — Solicitação de titular&quot;, informando seu
            nome e um meio de contato para resposta. Responderemos em prazo razoável,
            conforme a legislação.
          </PolicyParagraph>
          <PolicyParagraph>
            Você também pode apresentar reclamação à Autoridade Nacional de Proteção de
            Dados (ANPD).
          </PolicyParagraph>
        </PolicySection>

        <PolicySection id="menores" title="13. Crianças e adolescentes">
          <PolicyParagraph>
            O site é destinado ao público geral interessado em serviços de turismo. A
            campanha Rei da Copa exige telefone celular e perfil de Instagram — não é
            direcionada a crianças. Se tomarmos conhecimento de tratamento indevido de
            dados de menores sem consentimento parental adequado, adotaremos medidas
            para eliminar ou anonimizar essas informações.
          </PolicyParagraph>
        </PolicySection>

        <PolicySection id="alteracoes" title="14. Alterações desta política">
          <PolicyParagraph>
            Podemos atualizar esta Política de Privacidade para refletir mudanças no
            site, na legislação ou em integrações de terceiros. A data da última
            revisão será indicada no topo desta página. Alterações relevantes podem ser
            comunicadas por aviso no site ou pelos canais de contato habituais.
          </PolicyParagraph>
        </PolicySection>

        <PolicySection id="contato" title="15. Contato">
          <PolicyParagraph>
            Dúvidas sobre privacidade e proteção de dados:
          </PolicyParagraph>
          <PolicyList
            items={[
              <>
                E-mail:{" "}
                <a
                  href={contact.emailHref}
                  className="text-brand-navy underline-offset-2 hover:underline"
                >
                  {contact.email}
                </a>
              </>,
              <>
                WhatsApp:{" "}
                <a
                  href={contentLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-navy underline-offset-2 hover:underline"
                >
                  {contact.phone}
                </a>
              </>,
              <>
                Página de contato:{" "}
                <Link
                  href="/contato"
                  className="text-brand-navy underline-offset-2 hover:underline"
                >
                  crisdaspassagens.com.br/contato
                </Link>
              </>,
            ]}
          />
        </PolicySection>
      </Container>
    </Section>
  );
}
