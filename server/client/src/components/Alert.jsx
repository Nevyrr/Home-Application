import Notification from "./Notification";

const Alert = ({ msg, setMsg }) => {
  return (
    <Notification
      msg={msg}
      icon={"fa-triangle-exclamation"}
      color={"bg-red-500"}
      setMsg={setMsg}
      timer={5000} // time in msg before disappears
    ></Notification>
  );
};

export default Alert;

