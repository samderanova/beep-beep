import { useEffect } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./Schedule.module.scss";

export default function Schedule() {
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.push("/login");
    }})
  }, [])
  
  const logOut = () => {
    const user = auth.currentUser;
    console.log(user.email);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        auth.signOut()
          .then((_) => {
            router.push("/login");
          }).catch((_) => {
            console.log("Error with logging out")
          });
      }
    });
  }

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
          />
        </Col>
        <Col>
          <h1>Schedule</h1>
        </Col>
      </Row>
      <Row className={styles.logout + " mt-5"}>
        <Button className={styles.button} onClick={logOut}>Logout</Button>
      </Row>
    </Container>
  );
}
