/* eslint-disable react/prop-types */
import { createContext, useState } from "react";

// Post context to be used in useContext hook
export const ShoppingPostContext = createContext();

const ShoppingPostProvider = ({ children }) => {
  // Posts global state
  const [shoppingPosts, setShoppingPosts] = useState([]);

  // Return a custom component to expose Post state to the children components
  return (
    <ShoppingPostContext.Provider value={{ shoppingPosts, setShoppingPosts }}>
      {children}
    </ShoppingPostContext.Provider>
  );
};

export default ShoppingPostProvider;
