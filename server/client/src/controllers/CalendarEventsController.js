/**************************** Get All Calendar Events  ********************************/
const getEvents = async () => {
  const res = await fetch("/api/calendar-events");
  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};


/**************************** Create Calendar Event  ******************************/
const createEvent = async (title, date, duration, priorityColor) => {
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

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

/**************************** Delete Calendar Event  ******************************/
const deleteEvent = async (_id) => {
  const res = await fetch(`/api/calendar-events/${_id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

/**************************** Update Calendar Event  ******************************/
const updateEvent = async (_id, title, date, duration, priorityColor) => {
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

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

export { getEvents, createEvent, deleteEvent, updateEvent };
