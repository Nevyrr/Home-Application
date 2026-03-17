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

    const getEventsForDate = (tileDate: Date) => {
        return allEvents.filter((event) => {
            const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
            return isSameDate(eventDate, tileDate);
        });
    };

    const changeDate = (newDate: Value) => {
        const selectedDate = newDate instanceof Date ? newDate : new Date();
        setDate(selectedDate);
        handleDateChange(selectedDate);
    };

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        const eventsSelected = getEventsForDate(date);
        const priorityCounts = eventsSelected.reduce((groupedEvents, event) => {
            groupedEvents[event.priorityColor]++;
            return groupedEvents;
        }, [0, 0, 0, 0]);

        if (view === 'month') {
            return <>
                {eventsSelected.length > 0 && <span className="calendar-tile-count">{eventsSelected.length}</span>}
                <div className="calendar-dot-list">
                    {priorityCounts.map((item, index) => (
                        item !== 0 && (
                            <div key={index} className={getCssColor(index) + " dot text-white text-xs"}>
                                {item}
                            </div>
                        )
                    ))}
                </div>
            </>;
        }

        return null;
    };

    const tileClassName = ({ date, view }: { date: Date; view: string }) => {
        if (view !== 'month') {
            return undefined;
        }

        const eventsSelected = getEventsForDate(date);
        if (eventsSelected.length === 0) {
            return undefined;
        }

        const hasLocalEvents = eventsSelected.some((event) => event.user !== 'google');
        const hasGoogleEvents = eventsSelected.some((event) => event.user === 'google');
        const classes = ['calendar-tile-has-events'];

        if (hasLocalEvents) {
            classes.push('calendar-tile-has-local');
        }

        if (hasGoogleEvents) {
            classes.push('calendar-tile-has-google');
        }

        if (eventsSelected.length >= 3) {
            classes.push('calendar-tile-busy');
        }

        return classes.join(' ');
    };

    return (
        <div className="editable-calendar">
            <Calendar className="leading-[3rem] w-full relative"
                onChange={changeDate}
                value={date}
                locale="fr-FR"
                tileContent={tileContent}
                tileClassName={tileClassName}
            />
        </div>
    );
};

export default EditableCalendar;

