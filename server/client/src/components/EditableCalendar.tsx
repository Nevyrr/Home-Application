import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../style/calendar-override.css';
import { getCssColor } from './PriorityFlag.tsx';
import { isSameDate } from '../utils/index.ts';
import { CalendarEvent } from '../types/index.ts';
import { Value } from 'react-calendar/dist/cjs/shared/types';

interface EditableCalendarProps {
  allEvents: CalendarEvent[];
  handleDateChange: (date: Date) => void;
}

const EditableCalendar = ({ allEvents, handleDateChange }: EditableCalendarProps) => {

    const [date, setDate] = useState<Date>(new Date());

    const changeDate = (newDate: Value) => {
        const selectedDate = newDate instanceof Date ? newDate : new Date();
        setDate(selectedDate);
        handleDateChange(selectedDate);
    };

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        const eventsSelected = allEvents.filter((event) => {
            const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
            return isSameDate(eventDate, date);
        });
        const priorityCounts = eventsSelected.reduce((groupedEvents, event) => {
            groupedEvents[event.priorityColor]++;
            return groupedEvents;
        }, [0, 0, 0, 0]);

        if (view === 'month') {
            return <div className="calendar-dot-list">
                {priorityCounts.map((item, index) => (
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
        <div className="editable-calendar">
            <Calendar className="leading-[3rem] w-full relative"
                onChange={changeDate}
                value={date}
                tileContent={tileContent}
            />
        </div>
    );
};

export default EditableCalendar;

