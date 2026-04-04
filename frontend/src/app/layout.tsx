import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Radiora | Medical Imaging & Radiology Workflow Platform",
    template: "%s | Radiora"
  },
  description: "Radiora is the next-generation workflow platform for medical imaging. Connect PACS, HIS, and AI insights into a single, intelligent radiology workspace.",
  keywords: ["Radiology Workflow", "PACS Integration", "HIS Integration", "Medical Imaging AI", "DICOM Orchestration", "Radiology Dashboard"],
  authors: [{ name: "Radiora Team" }],
  creator: "Radiora Inc",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://radiora.app",
    title: "Radiora | Medical Imaging Reimagined",
    description: "Streamline your radiology department with Radiora's intelligent orchestration of PACS, HIS, and AI.",
    siteName: "Radiora",
  },
  twitter: {
    card: "summary_large_image",
    title: "Radiora | Medical Imaging Reimagined",
    description: "The intelligent intersection of PACS, HIS, and AI for modern radiology.",
    creator: "@radiora",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
