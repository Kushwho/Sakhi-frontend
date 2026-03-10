import type { Metadata } from "next";
import { Nunito, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers.tsx";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const nunito = Nunito({
    subsets: ["latin"],
    weight: ["400", "600", "700", "800", "900"],
    variable: "--font-nunito",
});

export const metadata: Metadata = {
    title: "Sakhi – Your AI Friend!",
    description:
        "Sakhi is a fun, kid-friendly voice AI companion that loves to chat, learn, and play with you!",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={cn("font-sans", geist.variable)}>
            <body className={`${nunito.variable} font-[family-name:var(--font-nunito)] antialiased`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
