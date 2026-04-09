import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getSessionUser } from "@/lib/adminAuth";
import { getPermissions } from "@/lib/permissions";
import AdminNav from "@/components/admin/AdminNav";
import BannerBar from "@/components/BannerBar";
import { getActiveBanners, getBannerSettings } from "@/lib/banners";

export const metadata = {
  title: "P&S Contracting And Landscape",
  description: "For 15 years, P&S Contracting and Landscape has been the premier landscaping company throughout all of Westmoreland County, Pennsylvania.",
};

export default async function RootLayout({ children }) {
  const user = await getSessionUser();
  const permissions = user ? getPermissions(user.role) : [];
  const banners = getActiveBanners();
  const settings = getBannerSettings();
  const stickyHeader = banners.some(b => b.sticky === true) ||
    (settings.scrollBanner && (settings.scrollBannerSticky === true));

  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="P&S" />
        <link rel="alternate" type="application/rss+xml" title="P&S Contracting and Landscape — Blog" href="/feed.xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {stickyHeader ? (
          <div className="sticky top-0 z-500">
            <BannerBar banners={banners} settings={settings} />
            <NavBar stickyDisabled />
          </div>
        ) : (
          <>
            <BannerBar banners={banners} settings={settings} />
            <NavBar />
          </>
        )}
        {user && <AdminNav username={user.username} permissions={permissions} />}
        {children}
        <Footer />
      </body>
    </html>
  );
}
