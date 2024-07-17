/* eslint-disable react/prop-types */
import { createContext, useState } from "react";

// Post context to be used in useContext hook
export const EventContext = createContext();

const EventProvider = ({ children }) => {
  // Posts global state
  const [events, setEvents] = useState([]);

  // Return a custom component to expose Post state to the children components
  return (
    <EventContext.Provider value={{ events, setEvents }}>
      {children}
    </EventContext.Provider>
  );
};

export default EventProvider;
