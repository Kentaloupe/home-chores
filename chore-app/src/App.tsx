import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AuthGuard } from './components/Auth/AuthGuard';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { CalendarView } from './components/Calendar/CalendarView';
import { ActivityForm } from './components/Activities/ActivityForm';
import { TeamList } from './components/Team/TeamList';
import type { Activity } from './types';

function AppContent() {
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showTeamList, setShowTeamList] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  const handleAddActivity = () => {
    setEditingActivity(null);
    setSelectedDate(undefined);
    setShowActivityForm(true);
  };

  const handleDateClick = (date: string) => {
    setEditingActivity(null);
    setSelectedDate(date);
    setShowActivityForm(true);
  };

  const handleEventClick = (activity: Activity, _date: string) => {
    setEditingActivity(activity);
    setSelectedDate(undefined);
    setShowActivityForm(true);
  };

  const handleCloseActivityForm = () => {
    setShowActivityForm(false);
    setEditingActivity(null);
    setSelectedDate(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header
        onAddActivity={handleAddActivity}
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

      {showActivityForm && (
        <ActivityForm
          activity={editingActivity}
          initialDate={selectedDate}
          onClose={handleCloseActivityForm}
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
    <AuthProvider>
      <AuthGuard>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthGuard>
    </AuthProvider>
  );
}

export default App;
