import dynamic from "next/dynamic";

export default function Search() {
  const Map = dynamic(() => import("@/pages/components/Map/Map"), {
    ssr: false,
  });

  return <Map />;
}
