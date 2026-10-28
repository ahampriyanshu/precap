import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "precap — a refresher for senior engineers",
    template: "%s · precap",
  },
  description:
    "Refresh the decisions behind shipping software, reliability, product, and AI. Compact guides for senior and staff engineers, alongside coding and system design practice.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
