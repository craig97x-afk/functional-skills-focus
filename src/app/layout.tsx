import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Functional Skills Focus",
  description: "Functional Skills Maths learning platform.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("app_settings")
    .select("accent_color, accent_strong")
    .eq("id", "default")
    .maybeSingle();

  const themeStyle =
    settings?.accent_color || settings?.accent_strong
      ? ({
          "--accent": settings?.accent_color ?? undefined,
          "--accent-strong":
            settings?.accent_strong ??
            settings?.accent_color ??
            undefined,
        } as CSSProperties)
      : undefined;

  return (
    <html lang="en" className="h-full" style={themeStyle} data-theme="light">
      <body className="min-h-screen">
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
