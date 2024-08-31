/* eslint-disable react/prop-types */
import { createContext, useState } from "react";

// Post context to be used in useContext hook
export const TacoContext = createContext();

const TacoProvider = ({ children }) => {
  // Posts global state
  const [taco, setTaco] = useState({
    vermifugeDate: "",
    vermifugeReminder: "",
    antiPuceDate: "",
    antiPuceReminder: "",
  });

  // Return a custom component to expose Post state to the children components
  return (
    <TacoContext.Provider value={{ taco, setTaco }}>
      {children}
    </TacoContext.Provider>
  );
};

export default TacoProvider;
