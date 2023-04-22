import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import { auth } from "@/lib/firebase";

export default function Search() {
  const Map = dynamic(() => import("@/pages/components/Map/Map"), {
    ssr: false,
  });
  return <Map />;
}
