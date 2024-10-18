import "bootstrap/dist/css/bootstrap.min.css";
import { CircleEllipsis, Redo2, Search, SquarePen, Undo2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import "./App.css";

const NotesApp = () => {
  const [renderArea, setRenderArea] = useState("list");
  const textAreaRef = useRef(null);
  const historyRef = useRef([]);
  const redoRef = useRef([]);
  const timeoutRef = useRef(null);
  const doneTextRef = useRef();
  const [textAreaStyled, setTextAreaStyled] = useState(false);
  const [noteID, setNoteID] = useState("");
  const [notePreviews, setNotePreviews] = useState([]);
  const [notesAmount, setNotesAmount] = useState();
  const [restoreWith, setRestoreWith] = useState('');
  const [searchText, setSearchText] = useState('');
  const searchRef = useRef('');

  useEffect(() => {
    GenerateNotePreviews();
    if (renderArea == "note") {
      // Autofocusing the textarea
      textAreaRef.current.focus();

      // Capturing history
      const captureHistory = () => {
        const currentValue = textAreaRef.current.value;
        if (
          historyRef.current.length === 0 ||
          currentValue !== historyRef.current[historyRef.current.length - 1]
        ) {
          historyRef.current.push(currentValue);
          // Clearing redo history on new input
          redoRef.current = [];
        }
      };

      const intervalId = setInterval(captureHistory, 2000);
      return () => {
        clearInterval(intervalId);
      };
    }
    // Only rendeirng when RenderArea is updated
  }, [renderArea]);

  const handleInputChange = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    const currentValue = textAreaRef.current.value;
    console.log('updating w current value');
    updateNoteInStorage(currentValue);
    console.log('updated w ', currentValue);

    timeoutRef.current = setTimeout(() => {

      if (
        historyRef.current.length === 0 ||
        currentValue !== historyRef.current[historyRef.current.length - 1]
      ) {
        historyRef.current.push(currentValue);
        // Clearing redo history on new input
        redoRef.current = [];
      }
    }, 2000);
  };

  const updateNoteInStorage = (noteInput) => {
    console.log(noteID);
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key == "IOSNotesApp" + noteID) {
        localStorage.setItem("IOSNotesApp" + noteID, Date.now() + "⌇" + noteInput)
        console.log('SET ITEM');
      } else {
        console.log('bad key');
      }
    }
  }

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
      // Getting last redo value
      const redoValue = redoRef.current.pop();
      // Pushing it to history
      historyRef.current.push(redoValue);
      // Setting it in the textarea
      textAreaRef.current.value = redoValue;
    }
  };

  // Putting date and time at the top, and updating it every 60 seconds (for every minute passed)
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

  // On inside click of the textarea
  const handleFocus = () => {
    doneTextRef.current.style.display = "inline";
  };

  // On outside click of the textarea
  const handleUnfocus = (e) => {
    if (
      !e.relatedTarget ||
      !e.relatedTarget.classList ||
      !e.relatedTarget.classList.contains("topButtons")
    ) {
      doneTextRef.current.style.display = "none";
    }
  };

  // This is the ellipsis icon at the top right
  const NoteSettingIcon = () => {
    return (
      <Dropdown>
        <Dropdown.Toggle
          className="noteSettingIcon topButtons"
          id="dropdown-basic"
        >
          <CircleEllipsis
            size={43}
            className="circleEllipsis"
            strokeWidth={1.25}
          />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {/* Only showing plain if something is selected */}
          {textAreaStyled == true && (
            <Dropdown.Item onClick={removeAllTextAreaClasses}>
              Plain
            </Dropdown.Item>
          )}
          <Dropdown.Item onClick={addSimpleBorderToTextArea}>
            Border
          </Dropdown.Item>
          <Dropdown.Item onClick={addSimpleLinesToTextArea}>
            Lines
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const addSimpleBorderToTextArea = () => {
    setTextAreaStyled(true);
    textAreaRef.current.classList.add("textAreaSimpleBorder");
  };

  const addSimpleLinesToTextArea = () => {
    setTextAreaStyled(true);
    textAreaRef.current.classList.add("textAreaSimpleLines");
  };

  // Removing all text area styling, such as the border or grids
  const removeAllTextAreaClasses = () => {
    setTextAreaStyled(false);
    textAreaRef.current.classList.remove("textAreaSimpleBorder");
    textAreaRef.current.classList.remove("textAreaSimpleLines");
  };

  const generateNoteIdentifier = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let tempNoteID = "";

    for (let i = 0; i < 30; i++) {
      tempNoteID += characters.charAt(Math.floor(Math.random() * 30));
    }

    return tempNoteID;
  };

  const insertNoteIntoLocalStorage = (noteID) => {
    // My idea is to insert it with a key such as 'IOSNotes' or whatever
    // Then, as the value, use unix epoch time and do a dash or some character separator, and then after that just the note content
    localStorage.setItem(
      "IOSNotesApp" + noteID,
      Date.now() + "⌇"
    );
  };

  // This function comprises of several functions that are used entirely to generate the notes preview on the main notes list landing page
  const GenerateNotePreviews = () => {

    // Used to generate note date on main list page
    const getUnixEpochTimeToDate = (unixTimestamp) => {
      const date = new Date(unixTimestamp * 1);

      const options = {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZone: "America/New_York",
        timeZoneName: "short",
      };

      const formatter = new Intl.DateTimeFormat("en-US", options);
      return formatter.format(date);
    };

    
    // Used to generate note date on main list page
    const getUnixTimeStamp = (noteContent) => {
      let index = noteContent.indexOf("⌇");
      let unixTime = noteContent.substring(0, index);
      return getUnixEpochTimeToDate(unixTime);
    };

    
    // Used to generate note title on main list page
    const generateNoteTitle = (noteContent) => {
      let index = noteContent.lastIndexOf("⌇");
      let title = noteContent.substring(index + 1, index + 36);
      return title;
    };

    
    // Used to get note ID and add to notesPreview array for use on main list page
    const getNoteID = (key) => {
      return key.substring(11, key.length);
    };

    // Looping through each note stored in localstorage and getting the ID, date, and generating a title
    // Then, setting notePreviews as this array of JSON objects.
    // notePreviews is then used in MainNotesList and looped over to generate the existing notes
    const notes = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      if (key.substring(0, 11) === "IOSNotesApp") {
        const json = {
          noteID: getNoteID(key),
          date: getUnixTimeStamp(value),
          title: generateNoteTitle(value),
        };
        notes.push(json);
      }
    }
    setNotesAmount(notes.length);
    setNotePreviews(notes);
  };

  // All this function is doing is setting the states and variables correctly for note rendering
  const HandleCreateNewNoteClick = () => {
    const tmpNID = generateNoteIdentifier();
    setNoteID(tmpNID);
    setRenderArea("note");
    insertNoteIntoLocalStorage(tmpNID);
  };

  const HandleNotesBackButton = () => {
    setNoteID("");
    setRestoreWith("");
    setRenderArea("list");
  };

  //Loading note if one is clicked
  const LoadExistingNote = (props) => {
    console.log(props);
    let valueToRestore;
    setNoteID(props.noteID);

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      if (key === "IOSNotesApp" + props.noteID) {
        let lastIndex = value.lastIndexOf('⌇');
        console.log(lastIndex);
        valueToRestore = value.substring(lastIndex + 1);
        break;
      }
    }

    setRestoreWith(valueToRestore); // Update the state with the value to restore
    setRenderArea("note"); // Update render area
  };

  // Update the textarea value when restoreWith changes
  useEffect(() => {
    RestoreText();
  }, [restoreWith]);

  const RestoreText = () => {
    if (restoreWith !== '') {
      setTimeout(function() {
        textAreaRef.current.value = restoreWith;
      }, 250)
    }
  }

  // This is the main notes list that you land on
  const MainNotesList = () => {
    function formatDate(date) {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
    
      const todayMonthDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const yesterdayMonthDay = new Date(today.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      const noteMonthDay = new Date(today.getFullYear(), date.getMonth(), date.getDate());
    
      // Checking if the date is today
      if (noteMonthDay.toDateString() === todayMonthDay.toDateString()) {
        return "Today";
      }
      // Checking if the date is yesterday
      else if (noteMonthDay.toDateString() === yesterdayMonthDay.toDateString()) {
        return "Yesterday";
      }
      // Checking if the date is within the last 7 days
      else if (noteMonthDay >= new Date(today.setDate(today.getDate() - 7))) {
        return date.toLocaleDateString("en-US", { weekday: "long" });
      }

      // For dates older than 7 days
      else {
        return "More than 7 days ago";
      }
    }

    const handleSearchChange = (e) => {
      const val = e.target.value;
      setSearchText(val);
    };

    //refocusing to fix issue with unfocus due to handleSearchChange messing with the state
    useEffect(() => {
      if (searchRef != '') {
        searchRef.current.focus()
      }
    }, [searchText])

    return (
      <div>
        <div className="notesListContainer">
          <h1 className="notesListH1">Notes</h1>
          <div className="searchContainer">
            <label className="searchIcon">
              <Search style={{ color: "#98989f" }} />
            </label>
            <input className="searchInputNotesList" onChange={handleSearchChange} value={searchText} ref={searchRef} placeholder="Search" />
          </div>
          <div>
            {filteredNotesPreviews &&
              filteredNotesPreviews.map((note) => {
              const dateString = note.date.replace(" at ", " ");
              const date = new Date(dateString);
              const time = date.toLocaleTimeString();
              const formattedDate = formatDate(date);
              return (
                <div key={note.noteID} className="existingNote" onClick={() => LoadExistingNote(note)}>
                <div className='existingNoteDate'>{formattedDate}</div>
                  <div className='existingNoteInner'>
                    <h3 className="existingNoteTitle">{note.title}</h3>
                    <div className='existingNoteTime'>{time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="notesListFooter">
          <div className="notesListCountText">{notesAmount > 0 ? `${notesAmount} Notes` : ''}</div>
          <div className="newNoteButton" onClick={HandleCreateNewNoteClick}>
            <SquarePen size={30} />
          </div>
        </div>
      </div>
    );
  };



  const filteredNotesPreviews =
  notePreviews &&
  notePreviews.filter((note) =>
    note.title.toLowerCase().includes(searchText.toLowerCase())
  );


  // Conditionally rendering the correct area depending on renderArea variable
  switch (renderArea) {
    case "list":
      return <MainNotesList />;
    case "note":
      return (
        <div className="notes-container">
          <div className="buttonsContainer">
            <div
              className="notesTopLeft hoverCursor"
              onClick={HandleNotesBackButton}
            >
              <span className="backButtonTop">⌵</span>
              <span className="notesTextBackButtonTop">Notes</span>
            </div>
  
            <div className="rightButtons hoverCursor">
              <div className="undoAndRedo-container topButtons">
                <Undo2 className="undoAndRedo" onClick={handleUndo} />
              </div>
              <div className="undoAndRedo-container topButtons">
                <Redo2 className="undoAndRedo" onClick={handleRedo} />
              </div>
              <NoteSettingIcon />
              <span className="doneText hoverCursor" ref={doneTextRef}>
                Done
              </span>
            </div>
          </div>
          <DateTimeComponent />
          <div className="textAreaContainer">
          {renderArea === "note" &&
            <textarea
              ref={textAreaRef}
              onFocus={handleFocus}
              onInput={handleInputChange}
              onBlur={handleUnfocus}
              label="Main notes area"
              className="notes-textarea"
            />
          }
          </div>
        </div>
      );
  }
};

export default NotesApp;
