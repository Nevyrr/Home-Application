import PriorityFlag from "./PriorityFlag";
import ValidationPopup from "./ValidationPopup";

const PostValidationPopup = ({ postName, actionType, showPopup, togglePopup, handleValidate, popupPost, setPopupPost: setPopupPostTitle,  setPriorityColor, inputs }) => {
  return (
    <ValidationPopup
      show={showPopup}
      onClose={togglePopup}
      title={`${actionType} ${postName}`}
      onValidate={handleValidate}
      children={<div className="relative">
        <input
          type="text"
          placeholder={`${postName} title`}
          className="input"
          value={popupPost.title}
          onChange={(e) => setPopupPostTitle(e.target.value)}
          autoFocus />
        {inputs}
        <PriorityFlag handlePriorityChangeCb={setPriorityColor} priorityColor={popupPost.priorityColor} /></div>}
    />
  );
};

export default PostValidationPopup;