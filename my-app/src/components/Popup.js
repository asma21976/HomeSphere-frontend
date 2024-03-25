import React, { useState } from "react";
import "./styles/Popup.css";

const Popup = ({ children, trigger, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleClick = () => {
    setIsVisible(!isVisible);
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <div onClick={handleClick}>{trigger}</div>
      {isVisible && (
        <div className="popup">
          <div className="popup-inner">
            <div className="popup-close" onClick={handleClose}>X</div>
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
