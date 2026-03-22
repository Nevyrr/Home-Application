import { Alert, Success, EditableCalendar } from "../../components/index.ts";
import { useApp } from "../../contexts/AppContext.tsx";
import { useAuth, useErrorHandler } from "../../hooks/index.ts";
import { useState, ReactNode, useEffect, useRef } from "react";
import { getEvents, deleteEvent, createEvent, updateEvent } from "../../controllers/CalendarEventsController.ts";
import PostList from "../../components/PostList.tsx";
import { fr } from "date-fns/locale";
import DatePicker from "react-datepicker";
import TimePicker from "react-time-picker";
import { isSameDate } from "../../utils/index.ts";
import CalendarPost from "../../components/CalendarPost.tsx";
import "react-datepicker/dist/react-datepicker.css";
import "react-time-picker/dist/TimePicker.css";
import { CalendarEvent, ExternalCalendarEvent } from "../../types/index.ts";
import {
  clearGoogleCalendarSession,
  disconnectGoogleCalendar,
  fetchGoogleCalendarEvents,
  getStoredGoogleCalendarToken,
  isGoogleConfigured,
  requestGoogleCalendarAccessToken,
} from "../../utils/google.ts";
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
  const [googleEvents, setGoogleEvents] = useState<ExternalCalendarEvent[]>([]);
  const [googleEventsOnDate, setGoogleEventsOnDate] = useState<ExternalCalendarEvent[]>([]);
  const [googleConnected, setGoogleConnected] = useState<boolean>(!!getStoredGoogleCalendarToken());
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const getMinutes = (event: { date?: Date | string; start?: string }): number => {
    const rawDate = event.date || event.start || new Date().toISOString();
    const parsedDate = typeof rawDate === "string" ? parseCalendarDate(rawDate) : rawDate;
    return parsedDate.getHours() * 60 + parsedDate.getMinutes();
  };

  const filterLocalEvents = (allEvents: CalendarEvent[], date: Date): CalendarEvent[] => {
    return [...allEvents]
      .filter((event) => isSameDate(parseCalendarDate(event.date), date))
      .sort((a, b) => {
        const minutesDiff = getMinutes(a) - getMinutes(b);
        if (minutesDiff !== 0) {
          return minutesDiff;
        }
        return b.priorityColor - a.priorityColor;
      });
  };

  const filterGoogleEvents = (allEvents: ExternalCalendarEvent[], date: Date): ExternalCalendarEvent[] => {
    return [...allEvents]
      .filter((event) => isSameDate(parseCalendarDate(event.start), date))
      .sort((a, b) => getMinutes(a) - getMinutes(b));
  };

  const refreshGoogleEvents = async (interactive = false) => {
    if (!isGoogleConfigured()) {
      setGoogleConnected(false);
      setGoogleEvents([]);
      setGoogleEventsOnDate([]);
      return;
    }

    setGoogleLoading(true);

    try {
      const token = await requestGoogleCalendarAccessToken(interactive);

      if (!token) {
        setGoogleConnected(false);
        setGoogleEvents([]);
        setGoogleEventsOnDate([]);
        return;
      }

      const timeMin = new Date();
      timeMin.setMonth(timeMin.getMonth() - 3);

      const timeMax = new Date();
      timeMax.setFullYear(timeMax.getFullYear() + 1);

      const googleCalendarEvents = await fetchGoogleCalendarEvents(timeMin, timeMax);
      setGoogleConnected(true);
      setGoogleEvents(googleCalendarEvents);
      setGoogleEventsOnDate(filterGoogleEvents(googleCalendarEvents, selectedDate));
    } catch (googleError) {
      clearGoogleCalendarSession();
      setGoogleConnected(false);
      setGoogleEvents([]);
      setGoogleEventsOnDate([]);
      setError(googleError instanceof Error ? googleError.message : "Impossible de recuperer l'agenda Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (getStoredGoogleCalendarToken()) {
      refreshGoogleEvents(false);
    }
  }, []);

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
    setGoogleEventsOnDate(filterGoogleEvents(googleEvents, newDate));
  };

  const resetAllFields = () => {
    setPopupEvent({ eventId: "", title: "", date: selectedDate, duration: "", priorityColor: 0 });
  };

  const setAllFields = (post: CalendarEvent) => {
    const postDate = parseCalendarDate(post.date);
    setPopupEvent({ eventId: post._id, title: post.title, date: postDate, duration: post.duration || "", priorityColor: post.priorityColor });
  };

  const handleCreate = async () => {
    if (!canWrite) {
      return;
    }

    await handleAsyncOperation(async () => {
      const response = await createEvent(popupEvent.title, popupEvent.date, popupEvent.duration, popupEvent.priorityColor);
      await filterEventsWithSelectedDate(selectedDate);
      if (response.success) {
        setSuccess(response.success);
      }
    }, null);
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
    }, null);
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
    }, null);
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
    }, null);
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

  const combinedCalendarEvents: CalendarEvent[] = [
    ...events,
    ...googleEvents.map((event) => ({
      _id: `google-${event.id}`,
      user: "google",
      username: "Agenda Google",
      title: event.title,
      date: parseCalendarDate(event.start),
      duration: event.isAllDay ? "Journee" : undefined,
      priorityColor: 0,
    })),
  ];
  const selectedDateLabel = selectedDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const localEventLabel = `${eventsOnDate.length} ${eventsOnDate.length > 1 ? "evenements locaux" : "evenement local"}`;

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
          <EditableCalendar allEvents={combinedCalendarEvents} handleDateChange={handleDateChange} />

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

          <div className="calendar-info-card calendar-sync-card">
            <div className="calendar-sync-head">
              <div>
                <p className="eyebrow">Agenda Google</p>
                <h2 className="calendar-card-title">Agenda Google</h2>
              </div>
              <span
                className={`calendar-status-pill ${
                  googleConnected ? "connected" : "disconnected"
                }`}
              >
                {googleConnected ? "Connecte" : "Non connecte"}
              </span>
            </div>

            {!isGoogleConfigured() ? (
              <p className="calendar-sync-note">
                Ajoute `VITE_GOOGLE_CLIENT_ID` pour activer la connexion Google sur le client.
              </p>
            ) : (
              <div className="calendar-sync-actions">
                <button className="ghost-button" onClick={() => refreshGoogleEvents(true)} disabled={googleLoading}>
                  {googleLoading ? "Connexion..." : googleConnected ? "Reconnecter Google" : "Connecter Google"}
                </button>
                {googleConnected && (
                  <>
                    <button className="ghost-button" onClick={() => refreshGoogleEvents(false)} disabled={googleLoading}>
                      Actualiser
                    </button>
                    <button
                      className="danger-button"
                      onClick={async () => {
                        await disconnectGoogleCalendar();
                        setGoogleConnected(false);
                        setGoogleEvents([]);
                        setGoogleEventsOnDate([]);
                        setSuccess("Agenda Google deconnecte");
                      }}
                    >
                      Deconnecter
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="events-calendar">
          <div className="calendar-list-event">
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
              handleCreate={handleCreate}
              handleUpdate={handleUpdate}
              handleDelete={handleDelete}
              setTitle={setTitle}
              setPriorityColor={setPriorityColor}
              setAllFields={setAllFields}
              resetAllFields={resetAllFields}
              popupInputs={dateInput()}
              showAddButton={canWrite}
              addButtonTitle="Ajouter evenement"
            />

            {canWrite && eventsOnDate.length > 0 && (
              <div className="calendar-clear-bar">
                <button className="calendar-clear-button" onClick={handleClearDay}>
                  <i className="fa-solid fa-trash-can"></i>
                  Vider la journee
                </button>
              </div>
            )}

            <div className="calendar-external-panel">
              <div className="calendar-external-head">
                <div>
                  <p className="eyebrow">Agenda externe</p>
                  <h2 className="calendar-card-title">Agenda Google</h2>
                </div>
                <span className="calendar-external-count">{googleEventsOnDate.length} evenement(s)</span>
              </div>

              {googleEventsOnDate.length === 0 ? (
                <p className="calendar-empty-copy">Aucun evenement Agenda Google pour cette date.</p>
              ) : (
                <div className="calendar-external-list">
                  {googleEventsOnDate.map((event) => (
                    <article key={event.id} className="calendar-external-event">
                      <div className="calendar-external-event-head">
                        <div>
                          <div className="calendar-external-meta">
                            <span className="priority-dot priority-0"></span>
                            <span>Agenda Google</span>
                            <span className="meta-separator">|</span>
                            <span>
                              {event.isAllDay
                                ? "Journee entiere"
                                : parseCalendarDate(event.start).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <h3 className="calendar-external-title">{event.title}</h3>
                          {event.location && <p className="calendar-external-location">{event.location}</p>}
                        </div>

                        {event.htmlLink && (
                          <a className="ghost-button" href={event.htmlLink} target="_blank" rel="noreferrer">
                            Ouvrir
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalendarTab;
