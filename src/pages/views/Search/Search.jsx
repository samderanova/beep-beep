import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";

export default function Search() {
  const Map = dynamic(() => import("@/pages/components/Map/Map"), {
    ssr: false,
  });

  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.push("/login");
    }})
  }, [])

  return (
    <div style={{ height: "80vh" }}>
      <Map />
    </div>
  );
}
