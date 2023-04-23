import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Col, Container, Row } from "react-bootstrap";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./Schedule.module.scss";

export default function Schedule() {
  const auth = getAuth();
  const [scheduled, setScheduled] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        const userRef = doc(db, "users", uid);
        const docSnap = await getDoc(userRef);
        setScheduled(docSnap.data().scheduled);
      } else {
        console.log("Ooga booga i am not logged in");
      }
    });
  }, []);

  const createEvents = () => {
    const events = [];
    for (let i = 0; i < scheduled.length; i++) {
      const event = {
        title: scheduled[i].id,
        start: new Date(scheduled[i].start),
        end: new Date(scheduled[i].end),
      };
      events.push(event);
    }
    return events;
  };

  return (
    <Container fluid className={styles.calendar + " p-5"}>
      <Row>
        <Col>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            events={createEvents()}
          />
        </Col>
        <Col>
          <h1>Schedule</h1>
        </Col>
      </Row>
    </Container>
  );
}
