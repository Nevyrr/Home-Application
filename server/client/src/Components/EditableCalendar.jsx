import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const EditableCalendar = () => {
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState({});

    const handleDateChange = (newDate) => {
        setDate(newDate);
    };

    const handleAddAction = () => {
        const action = prompt('Enter an action for this date:');
        if (action) {
            setEvents((prevActions) => ({
                ...prevActions,
                [date.toDateString()]: action,
            }));
        }
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month' && events[date.toDateString()]) {
            return <div className="dot"></div>;
        }
        return null;
    };

    return (
        <div className="page-calendar flex flex-row">
            <div className="editable-calendar w-1/5 relative">
                <div className="tools-calendar">
                    <h1 className='title'>{date.toDateString()}</h1>
                    <button className="fa-solid fa-circle-plus add-event-calendar" onClick={handleAddAction}></button>
                </div>
                <Calendar
                    onChange={handleDateChange}
                    value={date}
                    tileContent={tileContent}
                />
            </div>
            <div className="events-calendar w-4/5 text-center">
                {events[date.toDateString()] && (
                    <div className="events-list">
                        <h1 className="title">Events :</h1>
                        <h2 className="font-bold text-lg text-indigo-600 first-letter:uppercase">{events[date.toDateString()]}</h2>
                        <div className="h-px w-full bg-gradient-to-r from-indigo-50 via-indigo-500/70 to-indigo-50 mt-6"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditableCalendar;