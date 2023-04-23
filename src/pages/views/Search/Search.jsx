import Head from "next/head";
import dynamic from "next/dynamic";

export default function Search() {
  const Map = dynamic(() => import("@/pages/components/Map/Map"), {
    ssr: false,
  });

  return <>
    <Head>
      <title>Search | Beep Beep I'm Going Places</title>
    </Head>
    <Map />
  </>;
}
