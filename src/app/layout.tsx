import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ActivityTracker from "@/components/activity-tracker";
import AccessibilityWidget from "@/components/accessibility-widget";

export const metadata: Metadata = {
  title: "Functional Skills Focus",
  description: "Functional Skills Maths learning platform.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" data-theme="light">
      <body className="min-h-screen">
        <div className="min-h-screen flex flex-col">
          <ActivityTracker />
          <Header />
          <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
            {children}
          </div>
          <Footer />
          <AccessibilityWidget />
        </div>
      </body>
    </html>
  );
}
