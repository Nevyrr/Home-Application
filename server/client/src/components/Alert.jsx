import Notification from "./Notification";

const Alert = ({ msg }) => {
  return (
    <Notification
      msg={msg}
      icon={"fa-triangle-exclamation"}
      color={"bg-red-500"}
      timer={5000} // time in msg before disappears
    ></Notification>
  );
};

export default Alert;

