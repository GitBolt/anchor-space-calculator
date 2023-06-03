import Head from "next/head"

export const DefaultHead = () => {
  return (
    <Head>
      <title>Anchor Space Calculator</title>
      <meta name="description" content="Calculate your Anchor Program Data Account space" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {/* <link rel="icon" href="/favicon.ico" /> */}
    </Head>
  )
}