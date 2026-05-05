import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ETL Manager - Distribuidor de Carga",
  description:
    "Sistema administrativo para processamento e preparação de dados para otimização de distribuidor de carga",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className="font-sans antialiased">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
        <Toaster richColors position="top-right" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
