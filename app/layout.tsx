import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARC Labs — Prompt Reviewer",
  description:
    "Paste a system prompt and get structured feedback on clarity, ambiguity, injection surface, and failure modes.",
  openGraph: {
    title: "ARC Labs — Prompt Reviewer",
    description:
      "Free · Open Source. Review system prompts like a senior engineer — scores, failure modes, concrete rewrites.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
