import React, { useEffect, useRef, useState } from "react";
import Dropdown from 'react-bootstrap/Dropdown';
import { CircleEllipsis, Undo2, Redo2 } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";

const NotesApp = () => {
  const textAreaRef = useRef(null);
  const historyRef = useRef([]);
  const redoRef = useRef([]);
  const timeoutRef = useRef(null);
  const doneTextRef = useRef();
  const [textAreaStyled, setTextAreaStyled] = useState(false);

  useEffect(() => {
    //Autofocusing the textarea
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

  // on inside click of the textarea
  const handleFocus = () => {
    doneTextRef.current.style.display = 'inline';
  }

  // On outside click of the textarea
  const handleUnfocus = (e) => {
    if (!e.relatedTarget || !e.relatedTarget.classList || !e.relatedTarget.classList.contains('topButtons')) {
        doneTextRef.current.style.display = 'none';
    }
  };

  const NoteSettingIcon = () => {
    return (
      <Dropdown>
        <Dropdown.Toggle className='noteSettingIcon topButtons' id="dropdown-basic">
        <CircleEllipsis size={43} className='circleEllipsis' strokeWidth={1.25} />
        </Dropdown.Toggle>
  
        <Dropdown.Menu>
          {/* Only showing plain if something is selected */}
          {textAreaStyled == true && (
            <Dropdown.Item onClick={removeAllTextAreaClasses}>Plain</Dropdown.Item>
          )}
          <Dropdown.Item onClick={addSimpleBorderToTextArea}>Border</Dropdown.Item>
          <Dropdown.Item onClick={addSimpleLinesToTextArea}>Lines</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  const addSimpleBorderToTextArea = () => {
    setTextAreaStyled(true);
    textAreaRef.current.classList.add("textAreaSimpleBorder");
  }

  const addSimpleLinesToTextArea = () => {
    setTextAreaStyled(true);
    textAreaRef.current.classList.add("textAreaSimpleLines");
  }
  
  const removeAllTextAreaClasses = () => {
    setTextAreaStyled(false);
    textAreaRef.current.classList.remove("textAreaSimpleBorder");
    textAreaRef.current.classList.remove("textAreaSimpleLines");
  }

  return (
    <div className="notes-container">
    <div className='buttonsContainer'>
      <div className='notesTopLeft hoverCursor'>
        <span className='backButtonTop'>⌵</span>
        <span className='notesTextBackButtonTop'>Notes</span>
      </div>
      
      <div className="rightButtons hoverCursor">
        <div className="undoAndRedo-container topButtons">
          <Undo2 className="undoAndRedo" onClick={handleUndo}/>
        </div>
        <div className="undoAndRedo-container topButtons">
          <Redo2 className="undoAndRedo" onClick={handleRedo} />
        </div>
        <NoteSettingIcon />
        <span className='doneText hoverCursor' ref={doneTextRef}>Done</span>
      </div>
    </div>
    <DateTimeComponent />
    <div className="textAreaContainer">
      <textarea
        ref={textAreaRef}
        onFocus={handleFocus}
        onInput={handleInputChange}
        onBlur={handleUnfocus}
        label="Main notes area"
        className="notes-textarea"
      />
    </div>
  </div>
  );
};

export default NotesApp;
