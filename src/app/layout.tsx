import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Functional Skills Focus",
  description: "Functional Skills Maths learning platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
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

