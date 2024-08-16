/* eslint-disable react/prop-types */
import { createContext, useState } from "react";

// User context to be used in useContext hook
export const UserContext = createContext();

const UserProvider = ({ children }) => {
  
  // User global state
  const [user, setUser] = useState({
    id: localStorage.getItem("id"),
    name: localStorage.getItem("name"),
    email: localStorage.getItem("email"),
    receiveEmail: localStorage.getItem("receiveEmail"),
    isAdmin: localStorage.getItem("isAdmin")
  });

  // Return a custom component to expose User state to the children components
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
