import { CalendarEvent } from "../types/index.ts";
import { fetchWithAuth } from "../utils/authClient.ts";

interface ApiResponse {
  events?: CalendarEvent[];
  success?: string;
  error?: string;
  event?: CalendarEvent;
}

/**************************** Get All Calendar Events  ********************************/
const getEvents = async (): Promise<{ events: CalendarEvent[] }> => {
  const res = await fetchWithAuth("/api/calendar-events");

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    throw Error(text || "Failed to fetch events");
  }

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to fetch events");
  }

  const events = data.data?.events || data.events || [];
  return { events };
};

/**************************** Create Calendar Event  ******************************/
const createEvent = async (
  title: string,
  date: Date | string,
  duration: string,
  priorityColor: number
): Promise<ApiResponse> => {
  if (!title) {
    throw Error("Title is required");
  }
  if (!date) {
    throw Error("Date is required");
  }
  if (priorityColor === undefined) {
    throw Error("Priority color is required");
  }

  const res = await fetchWithAuth("/api/calendar-events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, date, duration, priorityColor }),
  });

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    throw Error(text || "Failed to create event");
  }

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to create event");
  }

  return {
    success: data.message || data.success,
    event: data.data?.event || data.event,
    ...data,
  };
};

/**************************** Delete Calendar Event  ******************************/
const deleteEvent = async (_id: string): Promise<ApiResponse> => {
  const res = await fetchWithAuth(`/api/calendar-events/${_id}`, {
    method: "DELETE",
  });

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    throw Error(text || "Failed to delete event");
  }

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to delete event");
  }

  return {
    success: data.message || data.success,
    ...data,
  };
};

/**************************** Update Calendar Event  ******************************/
const updateEvent = async (
  _id: string,
  title: string,
  date: Date | string,
  duration: string,
  priorityColor: number
): Promise<ApiResponse> => {
  if (!_id) {
    throw Error("EventId is required");
  }
  if (!title) {
    throw Error("Title is required");
  }
  if (priorityColor === undefined) {
    throw Error("Priority color is required");
  }

  const res = await fetchWithAuth(`/api/calendar-events/${_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, date, duration, priorityColor }),
  });

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    throw Error(text || "Failed to update event");
  }

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to update event");
  }

  return {
    success: data.message || data.success,
    event: data.data?.event || data.event,
    ...data,
  };
};

export { getEvents, createEvent, deleteEvent, updateEvent };
