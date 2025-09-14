import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.scss";
import Navbar from "@/components/nav/navbar";
import Footer from "@/components/footer/footer";
import UserProvider from "@/context/user-context";
import { Toaster } from "react-hot-toast";

const jost = Jost({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ccemandi.netlify.app/"),
  title: "CCE IIT Mandi",
  description:
    "A portal for cce fellows",

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={jost.className}>
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
          <div className="w-full min-h-screen">{children}</div>
          <div className="w-full">
            <Footer />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
