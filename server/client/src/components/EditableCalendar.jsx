import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getCssColor } from './PriorityFlag';

const EditableCalendar = ({ allEvents, handleDateChange }) => {

    const [date, setDate] = useState(new Date().toDateString());

    const changeDate = (newDate) => {
        setDate(newDate.toDateString());
        handleDateChange(newDate.toDateString());
    };

    const tileContent = ({ date, view }) => {
        const eventsSelected = allEvents.filter((event) => event.selectedDate === date.toDateString());
        const priorityCounts = eventsSelected.reduce((groupedEvents, event) => {
            groupedEvents[event.priorityColor]++;
            return groupedEvents;
        }, [0,0,0,0]);

        if (view === 'month') {
            return <div className="calendar-dot-list">
                { priorityCounts.map((item, index) => (
                    item !== 0 && (
                    <div key={index} className={getCssColor(index) + " dot text-white text-xs"}>
                        {item}
                    </div>
                    )
                ))}
            </div>;
        }

        return null;
    };

    return (
        <div className="editable-calendar w-2/5 relative">
            <Calendar className="leading-[3rem] w-full relative"
                onChange={changeDate}
                value={date}
                tileContent={tileContent}
            />
        </div>
    );
}

export default EditableCalendar;