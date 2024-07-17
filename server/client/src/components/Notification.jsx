import { useState } from "react";

const Notification = ({ msg, icon, color, timer }) => {
  const [show, setShow] = useState(true);

  setTimeout(() => setShow(false), timer);

  return (
    <div>
      {show && (
        <div className={color + " text-white p-2 rounded-md mt-6 text-sm mb-4 absolute left-1/4 top-6 w-1/2"}>
          <i className={icon + " fa-solid"}></i> {msg}
        </div>
      )}
    </div>
  );
};

export default Notification;
