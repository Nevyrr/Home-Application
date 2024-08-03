/* eslint-disable react/prop-types */
import { createContext, useState } from "react";

// Post context to be used in useContext hook
export const ShoppingPostContext = createContext();

const ShoppingItemProvider = ({ children }) => {
  // Posts global state
  const [shoppingItems, setShoppingItems] = useState([]);

  // Return a custom component to expose Post state to the children components
  return (
    <ShoppingPostContext.Provider value={{ shoppingItems: shoppingItems, setShoppingItems }}>
      {children}
    </ShoppingPostContext.Provider>
  );
};

export default ShoppingItemProvider;
