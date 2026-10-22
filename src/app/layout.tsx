import type { Metadata, Viewport } from "next";
import "@fontsource-variable/nunito";
import "./globals.css";
import "./lessons.css";
import "./progress.css";
import "./course.css";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/app-shell";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: "SQLearn — a little SQL, a little confidence",
    template: "%s · SQLearn",
  },
  description: siteConfig.description,
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#19181b" },
  ],
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var p=JSON.parse(localStorage.getItem('sqlearn:preferences')||'{}');if(p.theme==='dark')document.documentElement.dataset.theme='dark'}catch(e){}",
          }}
        />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
