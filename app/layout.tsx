import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { fontSans } from "@/config/fonts";
import { rootMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fontSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-clip font-sans">
        <Navbar />
        <main className="min-w-0 flex-1">{children}</main>
        <Footer />
        <WhatsAppFab />
      </body>
    </html>
  );
}
