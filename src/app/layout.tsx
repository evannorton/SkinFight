import "@radix-ui/themes/styles.css";
import "~/styles/globals.css";

import { Theme } from "@radix-ui/themes";
import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { SiteHeader } from "~/app/_components/site-header";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "SkinFight",
  description: "A skin competition",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <Theme appearance="dark" hasBackground>
          <TRPCReactProvider>
            <SiteHeader />
            {children}
          </TRPCReactProvider>
        </Theme>
      </body>
    </html>
  );
}
