import Notification from "./Notification.tsx";

interface AlertProps {
  msg: string;
  setMsg: (msg: string | null) => void;
}

const Alert = ({ msg, setMsg }: AlertProps) => {
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

