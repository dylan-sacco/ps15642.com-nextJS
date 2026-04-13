import { Geist, Geist_Mono, Playfair_Display, Raleway } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { getSessionUser } from "@/lib/adminAuth";
import { getPermissions } from "@/lib/permissions";
import AdminNav from "@/components/admin/AdminNav";
import BannerBar from "@/components/BannerBar";
import { getActiveBanners, getBannerSettings } from "@/lib/banners";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Loaded here so they're self-hosted and preloaded — no render-blocking Google Fonts request.
// HeroEarthwork, GreenCard, and PostHeader use 'Playfair Display' / 'Raleway' by name;
// next/font registers the @font-face so those string references keep working.
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

// ─── Viewport ────────────────────────────────────────────────────────────────
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#65a30d",
};

// ─── Site-wide metadata defaults ─────────────────────────────────────────────
export const metadata = {
  metadataBase: new URL("https://ps15642.com"),
  title: "P&S Contracting And Landscape",
  description:
    "For over 15 years, P&S Contracting and Landscape has been the premier landscaping company throughout all of Westmoreland County, Pennsylvania.",
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// ─── LocalBusiness structured data ───────────────────────────────────────────
// Appears on every page. Tells Google this is a real local business with a
// phone number, address, and service area — critical for the local search pack.
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "LandscapingBusiness"],
  "@id": "https://ps15642.com/#business",
  name: "P&S Contracting and Landscape",
  alternateName: "P and S Contracting",
  description:
    "Professional landscaping, hardscaping, contracting, and property maintenance services in Westmoreland County, PA since 2007.",
  url: "https://ps15642.com",
  telephone: "+17243828201",
  email: "pscontractingandlandscape@gmail.com",
  foundingDate: "2007",
  logo: {
    "@type": "ImageObject",
    url: "https://ps15642.com/logo.png",
  },
  image: "https://ps15642.com/hs1.webp",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Irwin",
    addressRegion: "PA",
    addressCountry: "US",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+17243828201",
    contactType: "customer service",
    email: "pscontractingandlandscape@gmail.com",
    areaServed: "US",
    availableLanguage: "English",
  },
  areaServed: [
    "Irwin, PA",
    "North Huntingdon, PA",
    "Greensburg, PA",
    "Latrobe, PA",
    "Trafford, PA",
    "North Irwin, PA",
    "Harrison City, PA",
    "Level Green, PA",
    "Westmoreland County, PA",
  ],
  priceRange: "$$",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Outdoor Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Landscaping Design and Installation" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hardscaping and Patio Construction" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "General Contracting" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tree Service and Stump Grinding" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Property Maintenance" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Drainage Solutions" } },
    ],
  },
  sameAs: [
    "https://www.facebook.com/PandSContractingandLandscape/",
    "https://www.instagram.com/p.s.contracting/",
    "https://goo.gl/maps/SYQwxzQwuiNtmQCDA",
    "https://www.bbb.org/us/pa/irwin/profile/landscape-contractors/ps-contracting-and-landscape-0141-71031381",
  ],
};

export default async function RootLayout({ children }) {
  const user = await getSessionUser();
  const permissions = user ? getPermissions(user.role) : [];
  const banners = getActiveBanners();
  const settings = getBannerSettings();
  const stickyHeader =
    banners.some((b) => b.sticky === true) ||
    (settings.scrollBanner && settings.scrollBannerSticky === true);

  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="P&S" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="P&S Contracting and Landscape — Blog"
          href="/feed.xml"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${raleway.variable} antialiased`}
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
