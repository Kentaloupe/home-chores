import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { CalendarView } from './components/Calendar/CalendarView';
import { ChoreForm } from './components/Chores/ChoreForm';
import { TeamList } from './components/Team/TeamList';
import type { Chore } from './types';

function AppContent() {
  const [showChoreForm, setShowChoreForm] = useState(false);
  const [showTeamList, setShowTeamList] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  const handleAddChore = () => {
    setEditingChore(null);
    setSelectedDate(undefined);
    setShowChoreForm(true);
  };

  const handleDateClick = (date: string) => {
    setEditingChore(null);
    setSelectedDate(date);
    setShowChoreForm(true);
  };

  const handleEventClick = (chore: Chore, _date: string) => {
    setEditingChore(chore);
    setSelectedDate(undefined);
    setShowChoreForm(true);
  };

  const handleCloseChoreForm = () => {
    setShowChoreForm(false);
    setEditingChore(null);
    setSelectedDate(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header
        onAddChore={handleAddChore}
        onManageTeam={() => setShowTeamList(true)}
      />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6">
          <CalendarView
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        </main>
      </div>

      {showChoreForm && (
        <ChoreForm
          chore={editingChore}
          initialDate={selectedDate}
          onClose={handleCloseChoreForm}
        />
      )}

      <TeamList
        isOpen={showTeamList}
        onClose={() => setShowTeamList(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
