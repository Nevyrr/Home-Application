import { CalendarEvent } from "../types/index.ts";
import { fetchWithAuth } from "../utils/authClient.ts";
import { ApiEnvelope, getApiMessage, readApiResponse } from "../utils/api.ts";

interface ApiResponse extends ApiEnvelope<{ events?: CalendarEvent[]; event?: CalendarEvent }> {
  events?: CalendarEvent[];
  success?: string;
  error?: string;
  event?: CalendarEvent;
}

/**************************** Get All Calendar Events  ********************************/
const getEvents = async (): Promise<{ events: CalendarEvent[] }> => {
  const res = await fetchWithAuth("/api/calendar-events");
  const data = await readApiResponse<ApiResponse>(res, "Failed to fetch events");

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

  const data = await readApiResponse<ApiResponse>(res, "Failed to create event");

  return {
    success: getApiMessage(data),
    event: data.data?.event || data.event,
    ...data,
  };
};

/**************************** Delete Calendar Event  ******************************/
const deleteEvent = async (_id: string): Promise<ApiResponse> => {
  const res = await fetchWithAuth(`/api/calendar-events/${_id}`, {
    method: "DELETE",
  });

  const data = await readApiResponse<ApiResponse>(res, "Failed to delete event");

  return {
    success: getApiMessage(data),
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

  const data = await readApiResponse<ApiResponse>(res, "Failed to update event");

  return {
    success: getApiMessage(data),
    event: data.data?.event || data.event,
    ...data,
  };
};

export { getEvents, createEvent, deleteEvent, updateEvent };
