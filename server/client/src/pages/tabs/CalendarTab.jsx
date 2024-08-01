import { Alert, Success, EditableCalendar } from "../../components";
import { CalendarEventContext } from "../../contexts/CalendarEventContext";
import { useContext, useEffect, useState } from "react";
import { getEvents, deleteEvent, createEvent, updateEvent } from "../../controllers/CalendarEventsController";
import PostList from "../../components/PostList";

const CalendarTab = () => {

  // Use event context
  const { events, setEvents } = useContext(CalendarEventContext);

  // Event being updated or created
  const [popupEvent, setPopupEvent] = useState({
    eventId: "",
    title: "",
    priorityColor: 0
  });

  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [eventsOnDate, setEventsOnDate] = useState([]);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const filterEventsWithSelectedDate = async (date) => {
    const data = await getEvents();
    setEvents(data.posts);

    if (date === undefined) {
      date = selectedDate;
    }
    
    const selectedDateEvents = data.posts.filter((event) => event.selectedDate === date);
    selectedDateEvents.sort((a, b) => b.priorityColor - a.priorityColor);
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
    setPopupEvent({ eventId: "", title: "", priorityColor: 0 });
  }

  const setAllFields = (post) => {
    setPopupEvent({ eventId: post._id, title: post.title, priorityColor: post.priorityColor });
  }

  const handleCreate = async () => {
    try {
      // Create a new event
      const msg = await createEvent(popupEvent.title, selectedDate, popupEvent.priorityColor);
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
      const msg = await updateEvent(popupEvent.eventId, popupEvent.title, popupEvent.priorityColor);
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
              title={selectedDate}
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
            />
            <button className="delete-button" onClick={handleClearDay}>Clear Day</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalendarTab;
