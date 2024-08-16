import { Alert, Success, EditableCalendar } from "../../components";
import { CalendarEventContext } from "../../contexts/CalendarEventContext";
import { useContext, useState } from "react";
import { getEvents, deleteEvent, createEvent, updateEvent } from "../../controllers/CalendarEventsController";
import PostList from "../../components/PostList";
import { fr } from 'date-fns/locale'; // Importer la locale française
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { isSameDate } from "../../helpers/dateHelper";
import CalendarPost from "../../components/CalendarPost";

const CalendarTab = () => {

  // Use event context
  const { events, setEvents } = useContext(CalendarEventContext);

  // Event being updated or created
  const [popupEvent, setPopupEvent] = useState({
    eventId: "",
    date: new Date(),
    title: "",
    priorityColor: 0
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventsOnDate, setEventsOnDate] = useState([]);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  /* Use to sort date using hour and minutes by adding hour and minutes of an event */
  const getMinutes = (event) => {
    return event.date.getHours() * 60 + event.date.getMinutes();
  }

  const filterEventsWithSelectedDate = async (date) => {
    const data = await getEvents();

    // Convert string date to real date

    const events = data.posts.map(event => {
      return {
        ...event, // keep event properties
        date: new Date(event.date) // Convert Date in real Date
      };
    });

    setEvents(events);

    if (date === undefined) {
      date = selectedDate;
    }

    const selectedDateEvents = events.filter((event) => isSameDate(event.date, date));
    selectedDateEvents.sort((a, b) => {
      //sort by hour then priority
      const minutesDiff = getMinutes(a) - getMinutes(b);
      if (minutesDiff !== 0) { return minutesDiff };
      return b.priorityColor - a.priorityColor;
    });
    // Update posts state
    setEventsOnDate(selectedDateEvents);
  };

  const updatePopup = (key, value) => {
    setPopupEvent(prevState => ({
      ...prevState,
      [key]: value
    }));
  };


  const setTitle = (title) => {
    updatePopup("title", title);
  }

  const setPriorityColor = (priorityColor) => {
    updatePopup("priorityColor", priorityColor);
  }

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    filterEventsWithSelectedDate(newDate);
  };

  const resetAllFields = () => {
    setPopupEvent({ eventId: "", title: "", date: selectedDate, priorityColor: 0 });
  }

  const setAllFields = (post) => {
    setPopupEvent({ eventId: post._id, title: post.title, date: post.date, priorityColor: post.priorityColor });
  }

  const handleCreate = async () => {
    try {
      // Create a new event
      const msg = await createEvent(popupEvent.title, popupEvent.date, popupEvent.priorityColor);
      // Update posts state
      filterEventsWithSelectedDate(selectedDate);
      // Set the success message
      setSuccess(msg.success);
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle delete post
  const handleUpdate = async () => {
    try {
      // Create a new event
      const msg = await updateEvent(popupEvent.eventId, popupEvent.title, popupEvent.date, popupEvent.priorityColor);
      // Update posts state
      filterEventsWithSelectedDate(selectedDate);
      // Set the success message
      setSuccess(msg.success);
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle delete post
  const handleDelete = async (_id) => {
    if (confirm("Confirm delete?")) {
      try {
        // Delete the post
        const msg = await deleteEvent(_id);
        // Update posts state
        filterEventsWithSelectedDate(selectedDate);
        // Set the success message
        setSuccess(msg.success);
      } catch (error) {
        setError(error.message);
      }
    }
  };

  // Handle delete post
  const handleClearDay = async (_id) => {
    if (confirm("Confirm delete?")) {
      try {
        // Delete the post
        for (const event of eventsOnDate) {
          await deleteEvent(event._id);
        }
        // Update posts state
        filterEventsWithSelectedDate(selectedDate);
        // Set the success message
        setSuccess("All tasks are done for today congrats !");
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const dateInput = () => {
    return <DatePicker
      selected={popupEvent.date}
      onChange={(date) => updatePopup("date", date)}
      showTimeSelect
      dateFormat="Pp" // Format date et heure
      locale={fr}
      className="calendar-datepicker-input text-center date-picker-reports"
      placeholderText="Choose a date"
    />;
  }

  return (
    <section className="card">
      {success && <Success msg={success} />}
      {error && <Alert msg={error} />}

      <div className="calendar-tab">
        <h1 className="title absolute text-4xl underline top-0">Shared Calendar</h1>
        <EditableCalendar
          allEvents={events}
          handleDateChange={handleDateChange}
        />
        <div className="events-calendar text-center">
          <div className="calendar-list-event">
            <PostList
              PostComposant={CalendarPost}
              title={<h1 className="font-bold text-2xl content-center">{selectedDate.toLocaleDateString()}</h1>}
              posts={eventsOnDate}
              sortPosts={filterEventsWithSelectedDate}
              popupPost={popupEvent}
              handleCreate={handleCreate}
              handleUpdate={handleUpdate}
              handleDelete={handleDelete}
              setTitle={setTitle}
              setPriorityColor={setPriorityColor}
              setAllFields={setAllFields}
              resetAllFields={resetAllFields}
              popupInputs={dateInput()}
            />
            <button className="delete-button" onClick={handleClearDay}>Clear Day</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalendarTab;
