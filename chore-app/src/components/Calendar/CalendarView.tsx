import { useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import { useApp } from '../../context/AppContext';
import type { Activity } from '../../types';
import { getOccurrences } from '../../utils/recurrence';
import { hexToRgba } from '../../utils/colors';

interface CalendarViewProps {
  onDateClick: (date: string) => void;
  onEventClick: (activity: Activity, date: string) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    activityId: string;
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

    for (const activity of state.activities) {
      const member = activity.assigneeId
        ? state.teamMembers.find(m => m.id === activity.assigneeId)
        : null;
      const color = member?.color || '#9ca3af';
      const assigneeName = member?.name || 'Unassigned';

      const startDate = new Date(activity.startDate);

      if (activity.recurrenceRule) {
        // Get all occurrences within the visible range
        const occurrences = getOccurrences(
          activity.recurrenceRule,
          startDate,
          rangeStart,
          rangeEnd
        );

        for (const occurrence of occurrences) {
          const dateStr = occurrence.toISOString().split('T')[0];
          const isCompleted = activity.completed.includes(dateStr);

          result.push({
            id: `${activity.id}-${dateStr}`,
            title: activity.title,
            start: occurrence,
            allDay: true,
            backgroundColor: isCompleted ? hexToRgba(color, 0.3) : color,
            borderColor: color,
            textColor: isCompleted ? '#6b7280' : '#ffffff',
            extendedProps: {
              activityId: activity.id,
              isCompleted,
              assigneeName,
            },
          });
        }
      } else {
        // Single or multi-day occurrence
        const dateStr = activity.startDate.split('T')[0];
        const isCompleted = activity.completed.includes(dateStr);

        // Calculate end date for calendar (FullCalendar end is exclusive, so add 1 day)
        let endDate: Date | undefined;
        if (activity.endDate) {
          endDate = new Date(activity.endDate);
          endDate.setDate(endDate.getDate() + 1);
        }

        result.push({
          id: activity.id,
          title: activity.title,
          start: startDate,
          end: endDate,
          allDay: true,
          backgroundColor: isCompleted ? hexToRgba(color, 0.3) : color,
          borderColor: color,
          textColor: isCompleted ? '#6b7280' : '#ffffff',
          extendedProps: {
            activityId: activity.id,
            isCompleted,
            assigneeName,
          },
        });
      }
    }

    return result;
  }, [state.activities, state.teamMembers]);

  const handleDateClick = (info: DateClickArg) => {
    onDateClick(info.dateStr);
  };

  const handleEventClick = (info: EventClickArg) => {
    const activityId = info.event.extendedProps.activityId;
    const activity = state.activities.find(a => a.id === activityId);
    if (activity) {
      const dateStr = info.event.startStr.split('T')[0];
      onEventClick(activity, dateStr);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 calendar-container">
      <style>{`
        .calendar-container .fc-daygrid-event {
          margin-bottom: 2px !important;
        }
        .calendar-container .fc-daygrid-day-events {
          min-height: auto !important;
        }
        .calendar-container .fc-daygrid-event-harness {
          margin-top: 1px !important;
        }
        .calendar-container .fc-event {
          border-radius: 4px !important;
        }
      `}</style>
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
        dayMaxEvents={false}
        eventOrder="start,-duration,allDay,title"
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
