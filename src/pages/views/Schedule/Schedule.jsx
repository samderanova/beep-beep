import { use, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Col, Container, Row, Card } from "react-bootstrap";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./Schedule.module.scss";

export default function Schedule() {
  const [eventSelected, setEventSelected] = useState("");
  const [scheduled, setScheduled] = useState([]);
  const [unscheduled, setUnscheduled] = useState([]);
  const auth = getAuth();

  const handleDateSelect = (selectInfo) => {
    console.log("handleDateSelect ran");
    // let title = prompt('Please enter a new title for your event')
    let calendarApi = selectInfo.view.calendar

    calendarApi.unselect() // clear date selection

    if (eventSelected !== "") {
      const newEvent = {
        title: eventSelected,
        start: new Date(selectInfo.startStr),
        end: new Date(selectInfo.endStr)
      }
      if (!scheduled.includes(newEvent)) {
        calendarApi.addEvent(newEvent);
        setScheduled([...scheduled, newEvent]);
        setUnscheduled(unscheduled.filter(unscheduledEvent => unscheduledEvent !== eventSelected));
        setEventSelected("");
      }
    }
  }

  const handleEventClick = (clickInfo) => {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      const removedEvent = clickInfo.event.title;
      clickInfo.event.remove();
      setScheduled(scheduled.filter(scheduledEvent => scheduledEvent.title !== eventSelected));
      setUnscheduled([...unscheduled, removedEvent]);
      setEventSelected("");
    }
  }

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        const userRef = doc(db, "users", uid);
        const docSnap = await getDoc(userRef);
        setScheduled(docSnap.data().scheduled);
        setUnscheduled(docSnap.data().unscheduled);
      } else {
        console.log("Ooga booga i am not logged in");
      }
    });
  }, []);

  const createEvents = () => {
    console.log("createEvents ran");
    const events = [];
    for (let i = 0; i < scheduled.length; i++) {
      const event = {
        title: scheduled[i].id,
        start: new Date(scheduled[i].start),
        end: new Date(scheduled[i].end),
      };
      events.push(event);
    }
    console.log(scheduled);
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
            select={handleDateSelect}
            eventClick={handleEventClick}
          />
        </Col>
        <Col>
          <h1>Schedule</h1>
          {unscheduled.map((unselectedEvent) => 
            <Card 
              key={unselectedEvent} 
              style={{
                backgroundColor: unselectedEvent === eventSelected ? 'lightblue' : '',
              }}
              onClick={() => setEventSelected( eventSelected === unselectedEvent ? "" : unselectedEvent)}
            >{unselectedEvent}</Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}