import "../styles.css";
import Head from "next/head";
import Script from "next/script";
import * as gtag from "../libs/gtag";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import Header from "../components/Header";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        <Header />
        <Component {...pageProps} />
      </ThemeProvider>

      <Analytics />

      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_MEASUREMENT_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

export default MyApp;
