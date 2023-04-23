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
  const [eventId, setEventId] = useState(0);
  const [eventSelected, setEventSelected] = useState("");
  const [scheduled, setScheduled] = useState([]);
  const auth = getAuth();

  // Example events for use
  const [events, setEvents] = useState(["SunTime", "MonDane", "TwosPlay", "Weddding", "Thurty-firth Bday", "Free Day", "Sat at Home"]);

  const handleDateSelect = (selectInfo) => {
    // let title = prompt('Please enter a new title for your event')
    let calendarApi = selectInfo.view.calendar

    calendarApi.unselect() // clear date selection

    if (eventSelected !== "") {
      calendarApi.addEvent({
        id: eventId,
        title: eventSelected,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      })
      setEventId(eventId+1);
      setEvents(events.filter(event => event !== eventSelected));
      setEventSelected("");
    }
  }

  const handleEventClick = (clickInfo) => {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      const removedEvent = clickInfo.event.title;
      clickInfo.event.remove();
      setEvents([...events, removedEvent]);
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
            select={handleDateSelect}
            eventClick={handleEventClick}
          />
        </Col>
        <Col>
          <h1>Schedule</h1>
          {events.map((event) => 
            <Card 
              key={event} 
              style={{
                backgroundColor: event === eventSelected ? 'lightblue' : '',
              }}
              onClick={() => setEventSelected( eventSelected === event ? "" : event)}
            >{event}</Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}