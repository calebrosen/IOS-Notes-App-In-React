import React, { useRef, useEffect, useState } from "react";
import "./App.css";

const NotesApp = () => {
  const textAreaRef = useRef(null);
  const historyRef = useRef([]);
  const redoRef = useRef([]);
  const timeoutRef = useRef(null);
  const [doneTextID] = useState('doneTextSpan');

  useEffect(() => {
    textAreaRef.current.focus();

    // Capturing history
    const captureHistory = () => {
      const currentValue = textAreaRef.current.value;
      if (historyRef.current.length === 0 || currentValue !== historyRef.current[historyRef.current.length - 1]) {
        historyRef.current.push(currentValue);
         // Clearing redo history on new input
        redoRef.current = [];
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
         // Clearing redo history on new input
        redoRef.current = [];
      }
    }, 2000);
  };

  // Restoring previous value
  const handleUndo = () => {
    if (historyRef.current.length > 1) {
      const currentValue = historyRef.current.pop();
      // Pushign current value to redo history
      redoRef.current.push(currentValue); 
      const previousValue = historyRef.current[historyRef.current.length - 1];
      textAreaRef.current.value = previousValue;
    } else if (historyRef.current.length === 1) {
      redoRef.current.push(historyRef.current.pop());
      textAreaRef.current.value = "";
    }
  };

  const handleRedo = () => {
    if (redoRef.current.length > 0) {
      // Get last redo value
      const redoValue = redoRef.current.pop(); 
      // Push it to history
      historyRef.current.push(redoValue); 
      // Setting it in the textarea
      textAreaRef.current.value = redoValue;
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

  const handleUnfocus = (e) => {
    if (!e.relatedTarget || !e.relatedTarget.classList || !e.relatedTarget.classList.contains('topButtons')) {
      const tmp = document.getElementById(doneTextID);
      if (tmp) {
        tmp.style.display = 'none';
      }
    }
  };

  return (
    <div className="notes-container">
    <div className='buttonsContainer'>
      <div className='notesTopLeft hoverCursor'>
        <span className='backButtonTop'>⌵</span>
        <span className='notesTextBackButtonTop'>Notes</span>
      </div>
      
      <div className='rightButtons'>
        <button className="undoButton topButtons hoverCursor" onClick={handleUndo}>↩</button>
        <button className="redoButton topButtons hoverCursor" onClick={handleRedo}>↪</button>
        <span className='doneText hoverCursor' id={doneTextID}>Done</span>
      </div>
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
