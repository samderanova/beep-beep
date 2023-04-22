import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Row, Col, Button, Toast } from "react-bootstrap";
import Plus from "@/assets/icons/plus-lg.svg";
import Minus from "@/assets/icons/dash-lg.svg";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import styles from "./Result.module.scss";

export default function Result({ count, result }) {
  const [added, setAdded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState("");

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
    if (added) {
      if (docSnap.data().scheduled.includes(result.id)) {
        let data = docSnap.data().scheduled;
        const index = data.indexOf(result.id);
        data = data.splice(index, 1);
        await updateDoc(userRef, {
          scheduled: data,
        });
      } else {
        let data = docSnap.data().unscheduled;
        const index = data.indexOf(result.id);
        data = data.splice(index, 1);
        await updateDoc(userRef, {
          unscheduled: data,
        });
      }
      setToastContent("Successfully removed location from schedule!");
    } else {
      const data = docSnap.data().unscheduled;
      data.push(result.id);
      await updateDoc(userRef, {
        unscheduled: data,
      });
      setToastContent("Successfully added location to schedule!");
    }
    setShowToast(true);
    setAdded(!added);
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
      <Toast onClose={() => setShow(false)} show={show} delay={10000} autohide>
        <Toast.Header></Toast.Header>
      </Toast>
    </Row>
  );
}
