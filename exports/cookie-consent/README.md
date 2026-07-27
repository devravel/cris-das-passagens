# Cookie consent (exportado de cris-das-passagens)

Pacote com o **aviso de cookies + modal de preferências** exatamente como no site, pronto para colar num Next.js (App Router) com Tailwind.

## Estrutura

```
config/consent.ts                          # textos (banner + modal)
components/consent/
  cookie-banner.tsx                        # banner inferior + overlay
  consent-preferences-modal.tsx            # modal "Preferências de cookies"
  consent-context.tsx                      # provider + useConsent()
  cookie-preferences-link.tsx              # link do rodapé
  consent-manager.tsx                      # ConsentRoot (banner + modal)
lib/consent/
  types.ts, storage.ts, store.ts, ...      # localStorage + store
```

Chave no `localStorage`: `cris-consent-preferences` (altere em `lib/consent/storage.ts` se quiser).

## Dependências do projeto destino

- Next.js App Router (`next/link`, `next/navigation`)
- Tailwind CSS
- `clsx` / `tailwind-merge` → `cn` em `@/lib/utils`
- `@/components/ui/button` (shadcn)
- `@/components/ui/dialog` (shadcn / Radix)
- Tokens usados nas classes: `brand-navy`, `brand`, `muted`, `border`, `ring`, `font-heading`  
  (troque por suas cores se não tiver esses tokens)

## Instalação

1. Copie as pastas para a raiz do outro projeto mantendo os paths `@/…`.
2. No `app/layout.tsx`:

```tsx
import { ConsentRoot } from "@/components/consent/consent-manager";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ConsentRoot>{children}</ConsentRoot>
      </body>
    </html>
  );
}
```

3. No rodapé (opcional), link para reabrir preferências:

```tsx
import { CookiePreferencesLink } from "@/components/consent/cookie-preferences-link";

<CookiePreferencesLink />
```

4. Ajuste o link da política em:
   - `cookie-banner.tsx` → `href="/politica-de-privacidade"`
   - `consent-preferences-modal.tsx` → mesmo href
5. Edite textos em `config/consent.ts`.
6. Conecte analytics/pixels em `lib/consent/apply.ts` (versão exportada vem com stubs).

## Copy do banner (texto exato)

> Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência, personalizar conteúdo e analisar o tráfego do site. Você pode aceitar ou recusar.

Botões: **Recusar** | **Aceitar**  
Título acessível: **Cookies e privacidade**  
Link: **Saiba mais** → `/politica-de-privacidade`
