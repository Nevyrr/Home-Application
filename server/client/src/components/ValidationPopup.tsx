import Popup from "./Popup.tsx";
import { ReactNode } from "react";

interface ValidationPopupProps {
  show: boolean;
  title: string;
  onClose: () => void;
  onValidate: () => void | Promise<void>;
  children: ReactNode;
  isValid?: boolean;
}

const ValidationPopup = ({ show, title, onClose, onValidate, children, isValid = true }: ValidationPopupProps) => {
  return (
    <Popup
      show={show}
      title={title}
      onClose={onClose}
      buttons={<button
        className="validate-button"
        onClick={onValidate}
        disabled={!isValid} >
        OK
      </button>}
      children={children}
    />
  );
};

export default ValidationPopup;

