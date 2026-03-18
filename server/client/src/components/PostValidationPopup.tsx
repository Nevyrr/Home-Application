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
  compactPriorityPicker?: boolean;
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
  isFieldValid = true,
  compactPriorityPicker = false,
}: PostValidationPopupProps) => {
  const [isTitle, setIsTitleValid] = useState<boolean>(popupPost.title !== undefined && popupPost.title !== "");
  const popupTitle = `${actionType} ${postName}`;
  const titleLabel = postName === "evenement" ? "Titre" : "Article";
  const titlePlaceholder = postName === "evenement" ? "Nom de l'evenement" : "Nom de l'article";

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
      title={popupTitle}
      onValidate={handleValidate}
      isValid={isFieldValid && isTitle}
      children={
        <div className="post-popup-form">
          <label className="post-popup-field">
            <span className="post-popup-label">{titleLabel}</span>
            <input
              type="text"
              placeholder={titlePlaceholder}
              className="input post-popup-title-input"
              value={popupPost.title || ""}
              onChange={onTitleChange}
              autoFocus
            />
          </label>

          {inputs}

          <div className={`post-popup-priority ${compactPriorityPicker ? "compact" : ""}`}>
            {compactPriorityPicker ? (
              <>
                <span className="post-popup-label">Priorite</span>
                <PriorityFlag
                  handlePriorityChangeCb={setPriorityColor}
                  priorityColor={popupPost.priorityColor || 0}
                  className="post-popup-priority-flag"
                />
              </>
            ) : (
              <>
                <div>
                  <p className="post-popup-label">Priorite</p>
                  <p className="post-popup-priority-copy">Un clic pour changer la couleur du drapeau.</p>
                </div>
                <PriorityFlag
                  handlePriorityChangeCb={setPriorityColor}
                  priorityColor={popupPost.priorityColor || 0}
                  className="post-popup-priority-flag"
                />
              </>
            )}
          </div>
        </div>
      }
    />
  );
};

export default PostValidationPopup;

