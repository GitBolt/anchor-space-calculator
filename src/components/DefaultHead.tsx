import Head from "next/head"

export const DefaultHead = () => {
  return (
    <Head>
      <title>Anchor Space Calculator</title>
      <meta name="description" content="Calculate your Anchor Program Data Account space" />
      <meta name="image" content="https://anchorspace.vercel.app/og.png" />
      <meta property="og:title" content={"Anchor Space Calculator"} />
      <meta property="og:description" content={"Calculate your Anchor Program Data Account space."} />
      <meta property="og:image" content="https://anchorspace.vercel.app/og.png" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://anchorspace.vercel.app/og.png" />
      <meta property="og:site_name" content={"Anchor Space Calculator"} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={"Anchor Space Calculator"} />
      <meta name="twitter:description" content={"Calculate your Anchor Program Data Account space"} />
      <meta name="twitter:image" content="https://anchorspace.vercel.app/og.png" />
      <meta name="twitter:image:alt" content={"Calculate your Anchor Program Data Account space"} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  )
}