import { Alert, Success, EditableCalendar } from "../../components/index.ts";
import { useApp } from "../../contexts/AppContext.tsx";
import { useAuth, useErrorHandler } from "../../hooks/index.ts";
import { useState, ReactNode, useEffect, useRef, FormEvent } from "react";
import { getEvents, deleteEvent, createEvent, updateEvent } from "../../controllers/CalendarEventsController.ts";
import PostList from "../../components/PostList.tsx";
import { fr } from "date-fns/locale";
import DatePicker from "react-datepicker";
import TimePicker from "react-time-picker";
import { isSameDate } from "../../utils/index.ts";
import CalendarPost from "../../components/CalendarPost.tsx";
import "react-datepicker/dist/react-datepicker.css";
import "react-time-picker/dist/TimePicker.css";
import { CalendarEvent } from "../../types/index.ts";
import { canUserWrite } from "../../utils/permissions.ts";

const parseCalendarDate = (value: Date | string): Date => {
  if (value instanceof Date) {
    return value;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }

  return new Date(value);
};

const EVENT_STATUS_OPTIONS = [
  { value: 0, label: "Neutre" },
  { value: 1, label: "Valide" },
  { value: 2, label: "Envisage" },
  { value: 3, label: "Action requise" },
];

// Valeur par defaut du champ datetime-local de l'ajout rapide : le jour selectionne a 9h,
// une heure raisonnable qui evite d'imposer un champ de plus a remplir dans le cas courant.
const toQuickAddDefault = (date: Date): string => {
  const pad = (value: number): string => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T09:00`;
};

const CalendarTab = () => {
  const { events, setEvents } = useApp();
  const { user } = useAuth();
  const { error, success, setError, setSuccess, handleAsyncOperation } = useErrorHandler();
  const hasLoadedEvents = useRef(false);
  const canWrite = canUserWrite(user);
  const legendItems = [
    { colorClass: "priority-1", label: "Valide" },
    { colorClass: "priority-2", label: "Envisage" },
    { colorClass: "priority-3", label: "Action requise" },
  ];

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
    priorityColor: 0,
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [eventsOnDate, setEventsOnDate] = useState<CalendarEvent[]>([]);
  const [quickAdd, setQuickAdd] = useState<{ title: string; date: string; priorityColor: number }>({
    title: "",
    date: toQuickAddDefault(new Date()),
    priorityColor: 0,
  });
  const [isQuickAdding, setIsQuickAdding] = useState<boolean>(false);

  const getMinutes = (date: Date): number => date.getHours() * 60 + date.getMinutes();

  const filterLocalEvents = (allEvents: CalendarEvent[], date: Date): CalendarEvent[] => {
    return [...allEvents]
      .filter((event) => isSameDate(parseCalendarDate(event.date), date))
      .sort((a, b) => {
        const minutesDiff = getMinutes(parseCalendarDate(a.date)) - getMinutes(parseCalendarDate(b.date));
        if (minutesDiff !== 0) {
          return minutesDiff;
        }
        return b.priorityColor - a.priorityColor;
      });
  };

  const filterEventsWithSelectedDate = async (date?: Date) => {
    const data = await getEvents();
    const eventsList: CalendarEvent[] = data.events.map((event) => ({
      ...event,
      date: parseCalendarDate(event.date),
    }));

    setEvents(eventsList);

    const filterDate = date || selectedDate;
    setEventsOnDate(filterLocalEvents(eventsList, filterDate));
  };

  useEffect(() => {
    if (hasLoadedEvents.current) {
      return;
    }

    hasLoadedEvents.current = true;
    void filterEventsWithSelectedDate(selectedDate);
  }, []);

  const updatePopup = (key: string, value: string | number | Date) => {
    setPopupEvent((prevState) => ({
      ...prevState,
      [key]: value,
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
    setEventsOnDate(filterLocalEvents(events, newDate));
    // Ne pas ecraser une saisie d'ajout rapide en cours si l'utilisateur navigue dans le mini-calendrier
    setQuickAdd((prevQuickAdd) =>
      prevQuickAdd.title.trim() ? prevQuickAdd : { ...prevQuickAdd, date: toQuickAddDefault(newDate) }
    );
  };

  const resetAllFields = () => {
    setPopupEvent({ eventId: "", title: "", date: selectedDate, duration: "", priorityColor: 0 });
  };

  const setAllFields = (post: CalendarEvent) => {
    const postDate = parseCalendarDate(post.date);
    setPopupEvent({ eventId: post._id, title: post.title, date: postDate, duration: post.duration || "", priorityColor: post.priorityColor });
  };

  const handleQuickAddSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canWrite || !quickAdd.title.trim() || !quickAdd.date || isQuickAdding) {
      return;
    }

    setIsQuickAdding(true);

    try {
      await handleAsyncOperation(async () => {
        // Le champ datetime-local ne porte pas de fuseau horaire : on le convertit ici, cote
        // navigateur (qui connait le fuseau reel de l'utilisateur), avant de l'envoyer au serveur.
        // Sinon le serveur (en UTC sur Render) interpreterait "09:00" comme 09:00 UTC au lieu
        // de 09:00 heure locale, d'ou un decalage de 1h ou 2h selon l'heure d'ete/hiver.
        const response = await createEvent(quickAdd.title.trim(), new Date(quickAdd.date), "", quickAdd.priorityColor);
        await filterEventsWithSelectedDate(selectedDate);
        if (response.success) {
          setSuccess(response.success);
        }
      }, null).catch(() => undefined);

      setQuickAdd({ title: "", date: toQuickAddDefault(selectedDate), priorityColor: 0 });
    } finally {
      setIsQuickAdding(false);
    }
  };

  const handleUpdate = async () => {
    if (!canWrite) {
      return;
    }

    await handleAsyncOperation(async () => {
      const response = await updateEvent(
        popupEvent.eventId,
        popupEvent.title,
        popupEvent.date,
        popupEvent.duration,
        popupEvent.priorityColor
      );
      await filterEventsWithSelectedDate(selectedDate);
      if (response.success) {
        setSuccess(response.success);
      }
    }, null).catch(() => undefined);
  };

  const handleDelete = async (_id: string) => {
    if (!canWrite) {
      return;
    }

    if (!confirm("Confirmer la suppression ?")) {
      return;
    }

    await handleAsyncOperation(async () => {
      const response = await deleteEvent(_id);
      await filterEventsWithSelectedDate(selectedDate);
      if (response.success) {
        setSuccess(response.success);
      }
    }, null).catch(() => undefined);
  };

  const handleClearDay = async () => {
    if (!canWrite) {
      return;
    }

    if (!confirm("Confirmer la suppression de tous les evenements du jour ?")) {
      return;
    }

    await handleAsyncOperation(async () => {
      for (const event of eventsOnDate) {
        await deleteEvent(event._id);
      }

      await filterEventsWithSelectedDate(selectedDate);
      setSuccess("Tous les evenements du jour ont ete supprimes");
    }, null).catch(() => undefined);
  };

  const dateInput = (): ReactNode => {
    return (
      <div className="calendar-popup-stack">
        <label className="post-popup-field">
          <span className="post-popup-label">Date</span>
          <DatePicker
            selected={popupEvent.date}
            onChange={(date: Date | null) => {
              if (date) {
                updatePopup("date", date);
              }
            }}
            showTimeSelect
            dateFormat="Pp"
            locale={fr}
            className="calendar-datepicker-input"
            calendarClassName="theme-datepicker"
            popperClassName="theme-datepicker-popper"
            placeholderText="Choisir une date"
          />
        </label>

        <label className="post-popup-field">
          <span className="post-popup-label">Duree</span>
          <TimePicker
            onChange={(duration: string | null) => {
              if (duration) {
                updatePopup("duration", duration);
              }
            }}
            value={popupEvent.duration}
            disableClock={true}
            format="HH:mm"
            className="calendar-popup-time-picker"
          />
        </label>
      </div>
    );
  };

  const selectedDateLabel = selectedDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const localEventLabel = `${eventsOnDate.length} ${eventsOnDate.length > 1 ? "evenements" : "evenement"}`;

  return (
    <section className="card calendar-shell">
      {success && <Success msg={success} setMsg={setSuccess} />}
      {error && <Alert msg={error} setMsg={setError} />}

      <div className="calendar-page-header">
        <h1 className="calendar-page-title">
          <i className="fa-solid fa-calendar-days text-primary"></i>
          Calendrier partage
        </h1>
      </div>

      <div className="calendar-tab">
        <div className="calendar-div">
          <EditableCalendar allEvents={events} handleDateChange={handleDateChange} />

          <div className="calendar-info-card calendar-legend-card">
            <span className="calendar-card-heading">
              <i className="fa-solid fa-info-circle text-primary"></i>
              Legende
            </span>
            <div className="calendar-legend">
              {legendItems.map((item) => (
                <div key={item.label} className="calendar-legend-item">
                  <span className={`priority-dot ${item.colorClass}`}></span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="events-calendar">
          <div className="calendar-list-event">
            {canWrite && (
              <form className="calendar-quick-add" onSubmit={handleQuickAddSubmit}>
                <h2 className="calendar-quick-add-title">Ajout rapide</h2>

                <div className="calendar-quick-add-fields">
                  <label className="calendar-quick-add-field calendar-quick-add-field-title">
                    <span className="calendar-quick-add-label">Evenement</span>
                    <input
                      type="text"
                      className="input"
                      value={quickAdd.title}
                      onChange={(event) => setQuickAdd((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="RDV dentiste, anniversaire..."
                    />
                  </label>

                  <label className="calendar-quick-add-field">
                    <span className="calendar-quick-add-label">Quand</span>
                    <input
                      type="datetime-local"
                      className="input"
                      value={quickAdd.date}
                      onChange={(event) => setQuickAdd((prev) => ({ ...prev, date: event.target.value }))}
                    />
                  </label>

                  <label className="calendar-quick-add-field">
                    <span className="calendar-quick-add-label">Statut</span>
                    <select
                      className="input"
                      value={quickAdd.priorityColor}
                      onChange={(event) => setQuickAdd((prev) => ({ ...prev, priorityColor: Number(event.target.value) }))}
                    >
                      {EVENT_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="submit"
                    className="calendar-quick-add-button"
                    disabled={!quickAdd.title.trim() || !quickAdd.date || isQuickAdding}
                  >
                    <i className="fa-solid fa-plus"></i>
                    {isQuickAdding ? "Ajout..." : "Ajouter"}
                  </button>
                </div>
              </form>
            )}

            <PostList
              popupEntityName="evenement"
              PostComposant={CalendarPost}
              title={
                <div className="calendar-day-heading">
                  <h1 className="calendar-day-title">
                    <i className="fa-solid fa-calendar-check text-primary"></i>
                    {selectedDateLabel}
                  </h1>
                  <span className="calendar-day-count">{localEventLabel}</span>
                </div>
              }
              posts={eventsOnDate}
              popupPost={popupEvent}
              handleCreate={() => undefined}
              handleUpdate={handleUpdate}
              handleDelete={handleDelete}
              setTitle={setTitle}
              setPriorityColor={setPriorityColor}
              setAllFields={setAllFields}
              resetAllFields={resetAllFields}
              popupInputs={dateInput()}
              showAddButton={false}
              emptyState={<p className="calendar-empty-copy">Aucun evenement pour cette date.</p>}
            />

            {canWrite && eventsOnDate.length > 0 && (
              <div className="calendar-clear-bar">
                <button className="calendar-clear-button" onClick={handleClearDay}>
                  <i className="fa-solid fa-trash-can"></i>
                  Vider la journee
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
