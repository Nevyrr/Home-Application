import { Alert, Success, EditableCalendar } from "../../components/index.ts";
import { useApp } from "../../contexts/AppContext.tsx";
import { useErrorHandler } from "../../hooks/index.ts";
import { useState, ReactNode, useEffect, useCallback } from "react";
import { getEvents, deleteEvent, createEvent, updateEvent } from "../../controllers/CalendarEventsController.ts";
import PostList from "../../components/PostList.tsx";
import { fr } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import TimePicker from 'react-time-picker';
import { isSameDate } from "../../utils/index.ts";
import CalendarPost from "../../components/CalendarPost.tsx";
import 'react-datepicker/dist/react-datepicker.css';
import 'react-time-picker/dist/TimePicker.css';
import { CalendarEvent } from "../../types/index.ts";

const CalendarTab = () => {
  const { events, setEvents } = useApp();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();

  // Event being updated or created
  const [popupEvent, setPopupEvent] = useState<{
    eventId: string;
    date: Date;
    duration: string;
    title: string;
    priorityColor: number;
  }>({
    eventId: "",
    date: new Date(),
    duration: "",
    title: "",
    priorityColor: 0
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [eventsOnDate, setEventsOnDate] = useState<CalendarEvent[]>([]);


  /* Use to sort date using hour and minutes by adding hour and minutes of an event */
  const getMinutes = (event: CalendarEvent): number => {
    const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
    return eventDate.getHours() * 60 + eventDate.getMinutes();
  };

  const filterEventsWithSelectedDate = useCallback(async (date?: Date) => {
    const data = await getEvents();

    // Convert string date to real date
    const eventsList: CalendarEvent[] = data.events.map(event => {
      return {
        ...event, // keep event properties
        date: typeof event.date === 'string' ? new Date(event.date) : event.date // Convert Date in real Date
      };
    });

    setEvents(eventsList);

    const filterDate = date || selectedDate;

    const selectedDateEvents = eventsList.filter((event) => {
      const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
      return isSameDate(eventDate, filterDate);
    });
    selectedDateEvents.sort((a, b) => {
      //sort by hour then priority
      const minutesDiff = getMinutes(a) - getMinutes(b);
      if (minutesDiff !== 0) { return minutesDiff; }
      return b.priorityColor - a.priorityColor;
    });
    // Update posts state
    setEventsOnDate(selectedDateEvents);
  }, [selectedDate]);

  // Charger les événements au montage du composant
  useEffect(() => {
    let mounted = true;
    const loadEvents = async () => {
      try {
        await filterEventsWithSelectedDate();
      } catch (error) {
        console.error('Error loading calendar events:', error);
        setError(error instanceof Error ? error.message : 'Erreur lors du chargement des événements');
      }
    };

    loadEvents();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Charger une seule fois au montage

  const updatePopup = (key: string, value: string | number | Date) => {
    setPopupEvent(prevState => ({
      ...prevState,
      [key]: value
    }));
  };


  const setTitle = (title: string) => {
    updatePopup("title", title);
  };

  const setPriorityColor = (priorityColor: number) => {
    updatePopup("priorityColor", priorityColor);
  };

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    filterEventsWithSelectedDate(newDate);
  };

  const resetAllFields = () => {
    setPopupEvent({ eventId: "", title: "", date: selectedDate, duration: "", priorityColor: 0 });
  };

  const setAllFields = (post: CalendarEvent) => {
    const postDate = typeof post.date === 'string' ? new Date(post.date) : post.date;
    setPopupEvent({ eventId: post._id, title: post.title, date: postDate, duration: post.duration || "", priorityColor: post.priorityColor });
  };

  const handleCreate = async () => {
    await handleAsyncOperation(
      async () => {
        const msg = await createEvent(popupEvent.title, popupEvent.date, popupEvent.duration, popupEvent.priorityColor);
        filterEventsWithSelectedDate(selectedDate);
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) setSuccess(msg.success);
    });
  };

  const handleUpdate = async () => {
    await handleAsyncOperation(
      async () => {
        const msg = await updateEvent(popupEvent.eventId, popupEvent.title, popupEvent.date, popupEvent.duration, popupEvent.priorityColor);
        filterEventsWithSelectedDate(selectedDate);
        return msg;
      },
      null
    ).then((msg) => {
      if (msg?.success) setSuccess(msg.success);
    });
  };

  const handleDelete = async (_id: string) => {
    if (confirm("Confirmer la suppression ?")) {
      await handleAsyncOperation(
        async () => {
          const msg = await deleteEvent(_id);
          filterEventsWithSelectedDate(selectedDate);
          return msg;
        },
        null
      ).then((msg) => {
        if (msg?.success) setSuccess(msg.success);
      });
    }
  };

  const handleClearDay = async () => {
    if (confirm("Confirmer la suppression de tous les événements du jour ?")) {
      await handleAsyncOperation(
        async () => {
          for (const event of eventsOnDate) {
            await deleteEvent(event._id);
          }
          filterEventsWithSelectedDate(selectedDate);
          return { success: "Tous les événements du jour ont été supprimés !" };
        },
        null
      ).then((msg) => {
        if (msg?.success) setSuccess(msg.success);
      });
    }
  };

  const dateInput = (): ReactNode => {
    return <div className="flex flex-col relative">
      <span className="absolute left-2 top-2 text-gray-400 pointer-events-none text-xs z-10">
        Date :
      </span>
      <DatePicker
        selected={popupEvent.date}
        onChange={(date: Date | null) => {
          if (date) updatePopup("date", date);
        }}
        showTimeSelect
        dateFormat="Pp" // Format date et heure
        locale={fr}
        className="calendar-datepicker-input"
        placeholderText="Choose a date"
      />
      <span className="absolute left-2 bottom-1 text-gray-400 pointer-events-none text-xs">
        Duration :
      </span>
      <TimePicker
        onChange={(duration: string | null) => {
          if (duration) updatePopup("duration", duration);
        }}
        value={popupEvent.duration}
        disableClock={true}
        format="HH:mm"
        className="calendar-popup-time-picker"
      />
    </div>;
  };

  return (
    <section className="card">
      {success && <Success msg={success} setMsg={setSuccess} />}
      {error && <Alert msg={error} setMsg={setError} />}

      <h1 className="font-bold text-xl text-text-heading flex items-center gap-2">
        <i className="fa-solid fa-calendar-days text-primary"></i>
        Calendrier partagé
      </h1>

      <div className="calendar-tab">

        <div className="calendar-div">
          <EditableCalendar
            allEvents={events}
            handleDateChange={handleDateChange}
          />
          <div className="bg-bg-panel border border-theme rounded-xl p-4 mt-4 flex flex-wrap items-center gap-4">
            <span className="font-semibold text-text-heading flex items-center gap-2">
              <i className="fa-solid fa-info-circle text-primary"></i>
              Légende:
            </span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-text-main">Validé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-text-main">Envisagé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-text-main">En attente d'une action</span>
            </div>
          </div>
        </div>
      
        <div className="events-calendar flex justify-center">
          <div className="calendar-list-event w-full max-w-2xl">
            <PostList
              PostComposant={CalendarPost}
              title={<h1 className="font-bold text-2xl text-text-heading flex items-center gap-2">
                <i className="fa-solid fa-calendar-check text-primary"></i>
                {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h1>}
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
            {eventsOnDate.length > 0 && (
              <div className="mt-4 flex justify-center">
                <button 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-bg-panel border border-theme text-text-main rounded-lg hover:bg-hover hover:border-red-500/50 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 font-medium text-sm" 
                  onClick={handleClearDay}
                >
                  <i className="fa-solid fa-trash-can"></i>
                  Vider la journée
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalendarTab;

