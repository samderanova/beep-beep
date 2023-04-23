import { use, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Col, Container, Row, Card } from "react-bootstrap";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "react-bootstrap";
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
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (eventSelected !== "") {
      const newEvent = {
        id: eventSelected.id,
        title: eventSelected.title,
        start: new Date(selectInfo.startStr),
        end: new Date(selectInfo.endStr),
      };
      if (!scheduled.includes(newEvent)) {
        calendarApi.addEvent(newEvent);
        setScheduled([...scheduled, newEvent]);
        setUnscheduled(
          unscheduled.filter(
            (unscheduledEvent) => unscheduledEvent !== eventSelected
          )
        );
        setEventSelected("");
        console.log(newEvent);
      }
    }
  };

  const handleEventClick = (clickInfo) => {
    if (
      confirm(
        `Are you sure you want to delete the event '${clickInfo.event.title}'`
      )
    ) {
      clickInfo.event.remove();
      const removedEvent = clickInfo.event.title;
      setScheduled(
        scheduled.filter(
          (scheduledEvent) => scheduledEvent.id !== eventSelected.id
        )
      );
      setUnscheduled([...unscheduled, removedEvent]);
      setEventSelected("");
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("in useEffect");
        const uid = user.uid;
        const userRef = doc(db, "users", uid);
        const docSnap = await getDoc(userRef);
        setScheduled(
          docSnap.data().scheduled.map((event) => {
            return {
              id: event.id,
              title: event.name,
              start: new Date(event.start),
              end: new Date(event.end),
            };
          })
        );
        setUnscheduled(docSnap.data().unscheduled);
        console.log("use effect done");
      } else {
        console.log("Ooga booga i am not logged in");
      }
    });
  }, []);

  // const createEvents = () => {
  //   console.log("createEvents ran");
  //   const events = [];
  //   for (let i = 0; i < scheduled.length; i++) {
  //     console.log(scheduled[i]);
  //     const event = {
  //       id: scheduled[i].id,
  //       title: scheduled[i].name,
  //       start: new Date(scheduled[i].start),
  //       end: new Date(scheduled[i].end),
  //     };
  //     console.log(event);
  //     events.push(event);
  //   }
  //   console.log(events);
  //   return events;
  // };

  const setEvents = (events) => {
    console.log("setEvents run");
    setScheduled(events);
    console.log(scheduled);
  };

  const onSubmit = async () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        const userRef = doc(db, "users", uid);
        // await updateDoc(userRef, {
        //   scheduled: scheduled,
        // });
        console.log(unscheduled);
        console.log(scheduled);
      }
    });
  };

  const genCards = () => {
    const cards = [];
    for (let i = 0; i < unscheduled.length; i++) {
      cards.push(
        <Card
          key={unscheduled[i].id}
          className={styles.card}
          style={{
            backgroundColor:
              unscheduled[i].id === eventSelected.id ? "lightblue" : "",
          }}
          onClick={() =>
            setEventSelected(
              eventSelected.id === unscheduled[i].id ? "" : unscheduled[i]
            )
          }
        >
          {unscheduled[i].name}
        </Card>
      );
    }

    console.log(cards);
    return cards;
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
            // initialEvents={createEvents()}
            initialEvents={[{ title: "event 1", date: "2021-09-01" }]}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventsSet={setEvents}
          />
          <Button className="mt-3" onClick={onSubmit}>
            Submit
          </Button>
        </Col>
        <Col>
          <div className={styles.cards}>
            <h1>Save</h1>
            {genCards()}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
