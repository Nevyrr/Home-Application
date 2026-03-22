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
  priorityMode?: "flag" | "select";
  priorityOptions?: Array<{ value: number; label: string }>;
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
  priorityMode = "flag",
  priorityOptions = [],
}: PostValidationPopupProps) => {
  const [isTitle, setIsTitleValid] = useState<boolean>(popupPost.title !== undefined && popupPost.title !== "");
  const isEventPopup = postName === "evenement";
  const actionLabel = actionType === "Update" || actionType === "Modifier" ? "Modifier" : "Ajouter";
  const popupTitle =
    isEventPopup
      ? `${actionLabel} evenement`
      : `${actionLabel} ${postName}`;
  const titleLabel = postName === "evenement" ? "Titre" : "Article";
  const titlePlaceholder =
    postName === "evenement"
      ? "Nom de l'evenement"
      : "Nom de l'article";
  const priorityLabel = "Priorite";
  const priorityHelp = "Un clic pour changer le niveau de priorite.";
  const priorityValue = typeof popupPost.priorityColor === "number" ? popupPost.priorityColor : 0;

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

  const onPriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriorityColor(Number(e.target.value));
  };

  const priorityControl =
    priorityMode === "select" && priorityOptions.length > 0 ? (
      <select
        className={`input post-popup-priority-select priority-tone-${priorityValue}`}
        value={priorityValue}
        onChange={onPriorityChange}
      >
        {priorityOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <PriorityFlag
        handlePriorityChangeCb={setPriorityColor}
        priorityColor={priorityValue}
        className="post-popup-priority-flag"
      />
    );
  
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
                <span className="post-popup-label">{priorityLabel}</span>
                {priorityControl}
              </>
            ) : (
              <>
                <div>
                  <p className="post-popup-label">{priorityLabel}</p>
                  <p className="post-popup-priority-copy">{priorityHelp}</p>
                </div>
                {priorityControl}
              </>
            )}
          </div>
        </div>
      }
    />
  );
};

export default PostValidationPopup;

