import React, { useState } from "react";
import "./styles/Popup.css";
import Button from "@mui/material/Button";

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
            {children}
            <Button
              variant="contained"
              style={{ backgroundColor: "#3846cb", color: "white" }}
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
