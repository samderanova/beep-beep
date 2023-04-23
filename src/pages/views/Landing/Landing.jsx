import React from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import styles from "./Landing.module.scss";
import Jeep from "@/assets/icons/jeep-svgrepo-com.svg";
import { Button } from "react-bootstrap";

export default function Landing() {
  const router = useRouter();

  function handleClick() {
    router.push("/login");
  }

  return (
    <div className={styles.landing}>
      <Head>
        <title>Beep Beep I'm Going Places</title>
      </Head>
      <div className={styles.card}>
        <div className={styles.heading}>
          <h1>BeepBeepI&apos;mGoingPlaces</h1>
        </div>
        <Image src={Jeep} width={100} alt="Jeep" />
        <Button
          variant="primary"
          className={styles.button}
          onClick={handleClick}
        >
          Login/Signup
        </Button>
      </div>
    </div>
  );
}
