import type { Metadata } from "next";
import { Outfit, Oswald } from "next/font/google";
import "./globals.scss";
import Navbar from "@/components/nav/navbar";
import Footer from "@/components/footer/footer";
import UserProvider from "@/context/user-context";
import { Toaster } from "react-hot-toast";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-outfit",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ccemandi.netlify.app/"),
  title: "CCE Fellows Network",
  description:
    "A portal for cce fellows",
  icons: {
    icon: "/sntc.png",
    shortcut: "/sntc.png",
    apple: "/sntc.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${oswald.variable} font-sans`}>
        {/*  Keep Toaster outside of context/provider */}
        <Toaster
          position="top-center"
          toastOptions={{
            className: "",
            style: {
              fontSize: "20px",
              padding: "10px 20px",
            },
          }}
        />
        <UserProvider>
          <div className="w-full h-16 sm:h-20 fixed top-0 z-50">
            <Navbar />
          </div>
          <div className="no-scrollbar w-full min-h-screen">{children}</div>
          <div className="no-scrollbar w-full">
            <Footer />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}