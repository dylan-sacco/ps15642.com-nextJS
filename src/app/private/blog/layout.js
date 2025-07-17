import { Geist, Geist_Mono } from "next/font/google";
import "../../(main)/globals.css";
import { FaFacebookSquare, FaGithub, FaGoogle, FaInstagram } from "react-icons/fa";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
        {children}
        <footer className="bg-green-600 text-white text-center p-4 py-12">
          <p>&copy; {new Date().getFullYear()} P & S Contracting and Landscape. All rights reserved.</p>

          <p className="text-sm flex items-center justify-center gap-1 mt-1">
            Website by
            <a
              href="https://github.com/dylan-sacco/ps15642.com-nextJS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime-900 hover:underline flex items-center gap-1"
            >
              Dylan Sacco <FaGithub />
            </a>
            v{process.env.NEXT_PUBLIC_APP_VERSION}
          </p>
        </footer>
      </body>
    </html>
  );
}
