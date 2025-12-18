import PriorityFlag from "./PriorityFlag.tsx";
import ValidationPopup from "./ValidationPopup.tsx";
import { useEffect, useState, ReactNode } from "react";

interface PostValidationPopupProps {
  postName: string;
  actionType: string;
  showPopup: boolean;
  togglePopup: () => void;
  handleValidate: () => void | Promise<void>;
  popupPost: { title?: string; priorityColor?: number; [key: string]: unknown };
  setPopupPost: (title: string) => void;
  setPriorityColor: (priority: number) => void;
  inputs?: ReactNode;
  isFieldValid?: boolean;
}

const PostValidationPopup = ({ 
  postName, 
  actionType, 
  showPopup, 
  togglePopup, 
  handleValidate, 
  popupPost, 
  setPopupPost: setPopupPostTitle, 
  setPriorityColor, 
  inputs, 
  isFieldValid = true 
}: PostValidationPopupProps) => {
  const [isTitle, setIsTitleValid] = useState<boolean>(popupPost.title !== undefined && popupPost.title !== "");

  useEffect(() => {
    if (showPopup) {
      setIsTitleValid(popupPost.title !== undefined && popupPost.title !== "");
    }
  }, [showPopup, popupPost.title]); // L'effet se déclenche lorsque isVisible change

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titleValue = e.target.value;
    setIsTitleValid(titleValue !== undefined && titleValue !== "");
    setPopupPostTitle(titleValue);
  };
  
  return (
    <ValidationPopup
      show={showPopup}
      onClose={togglePopup}
      title={`${actionType} ${postName}`}
      onValidate={handleValidate}
      isValid={isFieldValid && isTitle}
      children={<div className="relative">
        <input
          type="text"
          placeholder={`title`}
          className="input"
          value={popupPost.title || ""}
          onChange={onTitleChange}
          autoFocus />
        {inputs}
        <PriorityFlag handlePriorityChangeCb={setPriorityColor} priorityColor={popupPost.priorityColor || 0} /></div>}
    />
  );
};

export default PostValidationPopup;

