import Script from "next/script";

export default function Head() {
  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4605715481399190"
        crossOrigin="anonymous"
      />
    </>
  );
}