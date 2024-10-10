import React, { useRef, useEffect, useState } from "react";
import "./App.css";

const NotesApp = () => {
  const textAreaRef = useRef(null);
  const historyRef = useRef([]); // Undo history
  const redoRef = useRef([]); // Redo history
  const timeoutRef = useRef(null);
  const [doneTextID] = useState('doneTextSpan');

  useEffect(() => {
    textAreaRef.current.focus();

    // Capturing history
    const captureHistory = () => {
      const currentValue = textAreaRef.current.value;
      if (historyRef.current.length === 0 || currentValue !== historyRef.current[historyRef.current.length - 1]) {
        historyRef.current.push(currentValue);
        redoRef.current = []; // Clear redo history on new input
      }
    };

    const intervalId = setInterval(captureHistory, 2000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleInputChange = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const currentValue = textAreaRef.current.value;
      if (historyRef.current.length === 0 || currentValue !== historyRef.current[historyRef.current.length - 1]) {
        historyRef.current.push(currentValue);
        redoRef.current = []; // Clear redo history on new input
      }
    }, 2000);
  };

  // Restoring previous value
  const handleUndo = () => {
    if (historyRef.current.length > 1) {
      const currentValue = historyRef.current.pop();
      redoRef.current.push(currentValue); // Push current value to redo history
      const previousValue = historyRef.current[historyRef.current.length - 1];
      textAreaRef.current.value = previousValue;
    } else if (historyRef.current.length === 1) {
      redoRef.current.push(historyRef.current.pop());
      textAreaRef.current.value = "";
    }
  };

  const handleRedo = () => {
    if (redoRef.current.length > 0) {
      const redoValue = redoRef.current.pop(); // Get last redo value
      historyRef.current.push(redoValue); // Push it to history
      textAreaRef.current.value = redoValue; // Set it in the textarea
    }
  };

  const DateTimeComponent = () => {
    const [currentDateAndTime, setCurrentDateAndTime] = useState("");

    useEffect(() => {
      const updateDateTime = () => {
        const now = new Date();
        const formattedDate = now.toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });
        setCurrentDateAndTime(formattedDate);
      };

      updateDateTime();
      const intervalId = setInterval(updateDateTime, 60000);
      return () => clearInterval(intervalId);
    }, []);

    return <p className="dateAtTop">{currentDateAndTime}</p>;
  };

  const handleFocus = () => {
    const tmp = document.getElementById(doneTextID);
    tmp.style.display = 'inline';
  }

  const handleUnfocus = () => {
    const tmp = document.getElementById(doneTextID);
    tmp.style.display = 'none';
  };

  return (
    <div className="notes-container">
      <div className='buttonsContainer'>
        <button className="undoButton" onClick={handleUndo}>↩</button>
        <button className="redoButton" onClick={handleRedo}>↪</button>
        <span className='doneText' id={doneTextID}>Done</span>
      </div>
      <DateTimeComponent />
      <textarea
        ref={textAreaRef}
        onFocus={handleFocus}
        onInput={handleInputChange}
        onBlur={handleUnfocus}
        className="notes-textarea"
      />
    </div>
  );
};

export default NotesApp;
