import Notification from "./Notification";

const Success = ({ msg }) => {
  return (
    <Notification
      msg={msg}
      icon={"fa-circle-check"}
      color={"bg-green-500"}
      timer={3000} // time in msg before disappears
    ></Notification>
  );
};

export default Success;
