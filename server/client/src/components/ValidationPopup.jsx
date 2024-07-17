import Popup from "./Popup";

const ValidationPopup = ({ show, title, onClose, onValidate, children }) => {
  return (
    <Popup
      show={show}
      title={title}
      onClose={onClose}
      buttons={<button className="validate-button" onClick={onValidate}>OK</button>}
      children={children}
    />
  );
};

export default ValidationPopup;