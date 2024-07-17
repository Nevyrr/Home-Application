const Popup = ({ show, title, onClose, buttons, children }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="xpopup-overlay">
            <div className="xpopup">

                <button className="close-button" onClick={onClose}>X</button>
                <h1 className="title">{title}</h1>
                {children}
                <div className="xpopup-panel-buttons">
                    {buttons}
                </div>
            </div>
        </div>
    );
};

export default Popup;