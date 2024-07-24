/* eslint-disable react/prop-types */
import { createContext, useState } from "react";

// Post context to be used in useContext hook
export const ReminderPostContext = createContext();

const ReminderPostProvider = ({ children }) => {
  // Posts global state
  const [reminderPosts, setReminderPosts] = useState([]);

  // Return a custom component to expose Post state to the children components
  return (
    <ReminderPostContext.Provider value={{ reminderPosts, setReminderPosts }}>
      {children}
    </ReminderPostContext.Provider>
  );
};

export default ReminderPostProvider;
