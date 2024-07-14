import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const EditableCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [actions, setActions] = useState({});

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleAddAction = () => {
    const action = prompt('Enter an action for this date:');
    if (action) {
      setActions((prevActions) => ({
        ...prevActions,
        [date.toDateString()]: action,
      }));
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month' && actions[date.toDateString()]) {
      return <div className="dot"></div>;
    }
    return null;
  };

  return (
    <div className="actionable-calendar">
      <h2>Select a Date</h2>
      <Calendar 
        onChange={handleDateChange} 
        value={date} 
        tileContent={tileContent}
      />
      <div className="selected-date">
        <h3>Selected Date:</h3>
        <p>{date.toDateString()}</p>
        <button onClick={handleAddAction}>Add Action</button>
        {actions[date.toDateString()] && (
          <div className="action">
            <h4>Action:</h4>
            <p>{actions[date.toDateString()]}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableCalendar;