import { useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import { useApp } from '../../context/AppContext';
import type { Chore } from '../../types';
import { getOccurrences } from '../../utils/recurrence';
import { hexToRgba } from '../../utils/colors';

interface CalendarViewProps {
  onDateClick: (date: string) => void;
  onEventClick: (chore: Chore, date: string) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    choreId: string;
    isCompleted: boolean;
    assigneeName: string;
  };
}

export function CalendarView({ onDateClick, onEventClick }: CalendarViewProps) {
  const { state } = useApp();
  const calendarRef = useRef<FullCalendar>(null);

  const events = useMemo(() => {
    const result: CalendarEvent[] = [];
    const now = new Date();
    const rangeStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 4, 0);

    for (const chore of state.chores) {
      const member = chore.assigneeId
        ? state.teamMembers.find(m => m.id === chore.assigneeId)
        : null;
      const color = member?.color || '#9ca3af';
      const assigneeName = member?.name || 'Unassigned';

      const startDate = new Date(chore.startDate);

      if (chore.recurrenceRule) {
        // Get all occurrences within the visible range
        const occurrences = getOccurrences(
          chore.recurrenceRule,
          startDate,
          rangeStart,
          rangeEnd
        );

        for (const occurrence of occurrences) {
          const dateStr = occurrence.toISOString().split('T')[0];
          const isCompleted = chore.completed.includes(dateStr);

          result.push({
            id: `${chore.id}-${dateStr}`,
            title: chore.title,
            start: occurrence,
            allDay: true,
            backgroundColor: isCompleted ? hexToRgba(color, 0.3) : color,
            borderColor: color,
            textColor: isCompleted ? '#6b7280' : '#ffffff',
            extendedProps: {
              choreId: chore.id,
              isCompleted,
              assigneeName,
            },
          });
        }
      } else {
        // Single occurrence
        const dateStr = chore.startDate.split('T')[0];
        const isCompleted = chore.completed.includes(dateStr);

        result.push({
          id: chore.id,
          title: chore.title,
          start: startDate,
          allDay: true,
          backgroundColor: isCompleted ? hexToRgba(color, 0.3) : color,
          borderColor: color,
          textColor: isCompleted ? '#6b7280' : '#ffffff',
          extendedProps: {
            choreId: chore.id,
            isCompleted,
            assigneeName,
          },
        });
      }
    }

    return result;
  }, [state.chores, state.teamMembers]);

  const handleDateClick = (info: DateClickArg) => {
    onDateClick(info.dateStr);
  };

  const handleEventClick = (info: EventClickArg) => {
    const choreId = info.event.extendedProps.choreId;
    const chore = state.chores.find(c => c.id === choreId);
    if (chore) {
      const dateStr = info.event.startStr.split('T')[0];
      onEventClick(chore, dateStr);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
        eventDisplay="block"
        dayMaxEvents={3}
        eventContent={renderEventContent}
      />
    </div>
  );
}

function renderEventContent(eventInfo: { event: { title: string; extendedProps: { isCompleted: boolean; assigneeName: string } } }) {
  const { isCompleted, assigneeName } = eventInfo.event.extendedProps;

  return (
    <div className={`px-1 py-0.5 truncate ${isCompleted ? 'line-through' : ''}`}>
      <span className="font-medium">{eventInfo.event.title}</span>
      <span className="ml-1 opacity-75 text-[10px]">({assigneeName})</span>
    </div>
  );
}
