import PriorityFlag from "./PriorityFlag";
import ValidationPopup from "./ValidationPopup";
import { useEffect, useState } from "react";

const PostValidationPopup = ({ postName, actionType, showPopup, togglePopup, handleValidate, popupPost, setPopupPost: setPopupPostTitle,  setPriorityColor, inputs, isFieldValid=true }) => {
  const [isTitle, setIsTitleValid] = useState(popupPost.title !== undefined && popupPost.title !== "");

  useEffect(() => {
    if (showPopup) {
      setIsTitleValid(popupPost.title !== undefined && popupPost.title !== "");
    }
  }, [showPopup]); // L'effet se déclenche lorsque isVisible change

  const onTitleChange = (e) => {
    const titleValue = e.target.value;
    setIsTitleValid(titleValue !== undefined && titleValue !== "");
    setPopupPostTitle(titleValue);
  }
  
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
          placeholder={`${postName} title`}
          className="input"
          value={popupPost.title}
          onChange={onTitleChange}
          autoFocus />
        {inputs}
        <PriorityFlag handlePriorityChangeCb={setPriorityColor} priorityColor={popupPost.priorityColor} /></div>}
    />
  );
};

export default PostValidationPopup;