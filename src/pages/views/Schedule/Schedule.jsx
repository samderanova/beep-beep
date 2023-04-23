import { use, useState } from 'react';
import { Col, Container, Row, Card } from "react-bootstrap";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./Schedule.module.scss";

export default function Schedule() {

  const [eventId, setEventId] = useState(0);
  const [eventSelected, setEventSelected] = useState("");

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
