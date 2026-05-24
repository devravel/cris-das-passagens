import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { Toaster } from "@/components/ui/sonner";
import { fontSans } from "@/config/fonts";
import {
  createOrganizationJsonLd,
  createWebsiteJsonLd,
  rootMetadata,
} from "@/lib/seo";
import "./globals.css";

export const metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
    : null;

  return (
    <html
      lang="pt-BR"
      className={`${fontSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {supabaseOrigin ? (
          <>
            <link rel="preconnect" href={supabaseOrigin} />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        ) : null}
      </head>
      <body className="flex min-h-full flex-col overflow-x-clip font-sans">
        <JsonLdScript data={[createOrganizationJsonLd(), createWebsiteJsonLd()]} />
        <Navbar />
        <main className="min-w-0 flex-1">{children}</main>
        <Footer />
        <WhatsAppFab />
        <Toaster />
      </body>
    </html>
  );
}
