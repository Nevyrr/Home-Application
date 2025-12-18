import { CalendarEvent } from "../types/index.ts";

interface ApiResponse {
  events?: CalendarEvent[];
  success?: string;
  error?: string;
  event?: CalendarEvent;
}

/**************************** Get All Calendar Events  ********************************/
const getEvents = async (): Promise<{ events: CalendarEvent[] }> => {
  const res = await fetch("/api/calendar-events");
  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to fetch events");
  }

  return data as { events: CalendarEvent[] };
};


/**************************** Create Calendar Event  ******************************/
const createEvent = async (title: string, date: Date | string, duration: string, priorityColor: number): Promise<ApiResponse> => {
  if (!title) {
    throw Error("Title is required");
  }
  if (!date) {
    throw Error("Date is required");
  }
  if (priorityColor === undefined) {
    throw Error("Priority color is required");
  }

  const res = await fetch("/api/calendar-events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ title, date, duration, priorityColor }),
  });

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to create event");
  }

  return data;
};

/**************************** Delete Calendar Event  ******************************/
const deleteEvent = async (_id: string): Promise<ApiResponse> => {
  const res = await fetch(`/api/calendar-events/${_id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to delete event");
  }

  return data;
};

/**************************** Update Calendar Event  ******************************/
const updateEvent = async (_id: string, title: string, date: Date | string, duration: string, priorityColor: number): Promise<ApiResponse> => {
  if (!_id) {
    throw Error("EventId is required");
  }
  if (!title) {
    throw Error("Title is required");
  }
  if (priorityColor === undefined) {
    throw Error("Priority color is required");
  }

  const res = await fetch(`/api/calendar-events/${_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ title, date, duration, priorityColor }),
  });

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to update event");
  }

  return data;
};

export { getEvents, createEvent, deleteEvent, updateEvent };

