import Notification from "./Notification.tsx";

interface SuccessProps {
  msg: string;
  setMsg: (msg: string | null) => void;
}

const Success = ({ msg, setMsg }: SuccessProps) => {
  return (
    <Notification
      msg={msg}
      icon={"fa-circle-check"}
      color={"bg-green-500"}
      setMsg={setMsg}
      timer={3000} // time in msg before disappears
    ></Notification>
  );
};

export default Success;

