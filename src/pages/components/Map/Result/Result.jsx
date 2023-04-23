import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Row, Col, Button } from "react-bootstrap";
import Plus from "@/assets/icons/plus-lg.svg";
import Minus from "@/assets/icons/dash-lg.svg";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import styles from "./Result.module.scss";

export default function Result({ count, result, notify, setToastContent }) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const determineAdded = async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userRef);
      setAdded(
        docSnap.data().unscheduled.includes(result.id) ||
          docSnap.data().scheduled.includes(result.id)
      );
    };
    determineAdded().then();
  }, []);

  async function updateLocation() {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const docSnap = await getDoc(userRef);
    const data = docSnap.data();
    let newData;
    if (added) {
      if (data.scheduled.includes(result.id)) {
        newData = data.scheduled.filter(
          (_, index) => index != data.scheduled.indexOf(result.id)
        );
        await updateDoc(userRef, { scheduled: newData });
      } else {
        newData = data.unscheduled.filter(
          (_, index) => index != data.unscheduled.indexOf(result.id)
        );
        await updateDoc(userRef, { unscheduled: newData });
      }
    } else {
      newData = data.unscheduled;
      newData.push(result.id);
      await updateDoc(userRef, { unscheduled: newData });
    }

    setAdded(!added);
    notify();
  }

  return (
    <Row
      className={
        styles.externalLink +
        " align-items-center border-dark border-bottom py-3"
      }
    >
      <Col xs={10}>
        <Link href={result.url} target="_blank" rel="noreferrer">
          <strong>
            {count}. {result.name}
          </strong>
          <p className="m-0">{result.location}</p>
        </Link>
      </Col>
      <Col className="text-end">
        <Button variant="None" onClick={updateLocation}>
          {added ? (
            <Image src={Minus} width={20} alt="minus" />
          ) : (
            <Image src={Plus} width={20} alt="plus" />
          )}
        </Button>
      </Col>
    </Row>
  );
}
