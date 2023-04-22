import { useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    auth.signOut();
    router.push("/");
  });
  return <></>;
}
