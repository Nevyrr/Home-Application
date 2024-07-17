/* eslint-disable react/prop-types */
import { createContext, useState } from "react";

// Post context to be used in useContext hook
export const CalendarEventContext = createContext();

const CalendarEventProvider = ({ children }) => {
  // Posts global state
  const [events, setEvents] = useState([]);

  // Return a custom component to expose Post state to the children components
  return (
    <CalendarEventContext.Provider value={{ events, setEvents }}>
      {children}
    </CalendarEventContext.Provider>
  );
};

export default CalendarEventProvider;
