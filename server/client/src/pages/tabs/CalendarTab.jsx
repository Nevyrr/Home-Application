import { Alert, Success, ValidationPopup, EditableCalendar, PriorityFlag, CalendarPost } from "../../components";
import { EventContext } from "../../contexts/EventContext";
import { useContext, useEffect, useState } from "react";
import { getEvents, deleteEvent, createEvent, updateEvent } from "../../controllers/CalendarEventsController";
import { jwtDecode } from "jwt-decode";

const CalendarTab = () => {

  // Use event context
  const { events, setEvents } = useContext(EventContext);

  const [userId, setUserId] = useState("");
  const [eventId, setEventId] = useState("");
  const [title, setTitle] = useState("");
  const [priorityColor, setPriorityColor] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [allEvents, setAllEvents] = useState([]);

  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Grab all the posts on page load
  useEffect(() => {
    setTimeout(async () => {
      // Grab all posts
      filterEventsWithSelectedDate(selectedDate);
      // Find actual user
      const token = localStorage.getItem("token");
      if (token) {
        setUserId((jwtDecode(token))._id);
      }

      // Remove the loading
      setLoading(false);
    }, 1000);
  }, []);


  const filterEventsWithSelectedDate = async (date) => {
    const data = await getEvents();
    setAllEvents(data.events);
    const selectedDateEvents = data.events.filter((event) => event.selectedDate === date);
    selectedDateEvents.sort((a, b) => b.priorityColor - a.priorityColor);
    // Update posts state
    setEvents(selectedDateEvents);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    filterEventsWithSelectedDate(newDate);
  };

  const toggleCreationPopup = () => {
    if (showCreatePopup) {
      resetAllFields();
    }
    setShowCreatePopup(!showCreatePopup);
  };

  const toggleUpdatePopup = (post) => {
    if (showUpdatePopup) {
      resetAllFields();
    } else {
     setAllFields(post);
    }
    setShowUpdatePopup(!showUpdatePopup);
  };

  const resetAllFields = () => {
    setTitle("");
    setPriorityColor(0);
  }

  const setAllFields = (post) => {
    setEventId(post._id);
    setTitle(post.title);
    setPriorityColor(post.priorityColor);
  }

  const handleCreate = async () => {
    try {
      // Create a new event
      const msg = await createEvent(title, selectedDate, priorityColor);
      // Update posts state
      filterEventsWithSelectedDate(selectedDate);
      // Set the success message
      setSuccess(msg.success);
    } catch (error) {
      setError(error.message);
    }
    // Close Popup
    toggleCreationPopup();
  };

  // Handle delete post
  const handleUpdate = async () => {
    try {
      // Create a new event
      const msg = await updateEvent(eventId, title, priorityColor);
      // Update posts state
      filterEventsWithSelectedDate(selectedDate);
      // Set the success message
      setSuccess(msg.success);
    } catch (error) {
      setError(error.message);
    }
    // Close Popup
    toggleUpdatePopup();
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

  return (
    <section className="card">
      <h1 className="title">Calendar Events</h1>

      {loading && (<i className="fa-solid fa-spinner animate-spin text-3xl fixed inset-0 flex items-center justify-center"></i>)}
      {success && <Success msg={success} />}
      {error && <Alert msg={error} />}

      <ValidationPopup
        show={showCreatePopup}
        onClose={toggleCreationPopup}
        title={"Add Calendar Event"}
        onValidate={handleCreate}
        children={<div className="calendar-popup-input relative"><input
          type="text"
          placeholder="Event Title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus /><PriorityFlag handlePriorityChangeCb={setPriorityColor} /></div>}
      />
      <ValidationPopup
        show={showUpdatePopup}
        onClose={toggleUpdatePopup}
        title={"Update Calendar Event"}
        onValidate={handleUpdate}
        children={<div className="calendar-popup-input relative"><input
          type="text"
          placeholder="Event Title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus /><PriorityFlag handlePriorityChangeCb={setPriorityColor} priorityColor={priorityColor} /></div>}
      />

      <div className="page-calendar flex flex-row justify-evenly">
        <EditableCalendar
          allEvents={allEvents}
          handleDateChange={handleDateChange}
        />
        <div className="events-calendar w-2/5 text-center">
          <div className="events-calendar flex justify-evenly mb-8">
            <h1 className='font-bold text-2xl'>{selectedDate}</h1>
            <button className="fa-solid fa-circle-plus add-event-calendar" onClick={toggleCreationPopup}></button>
          </div>
          <div className="calendar-list-event">
            {events &&
              events.map((event) => (
                <div key={event._id} className="calendar-post">
                  <CalendarPost
                    post={event}
                    userId={userId}
                    onUpdate={toggleUpdatePopup}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalendarTab;
