import { useState } from "react";

import EventTable from "./components/EventTable";
import SessionTable from "./components/SessionTable";

import { EventPlanner } from "./model/event_planner";
import { IndexedDBRepository } from "./repo/indexedb_repository";

import { OfflineBanner } from "./components/OfflineBanner";

import "./App.css";

const repository =
  new IndexedDBRepository();

const planner =
  new EventPlanner(repository);

function App() {
  const [selectedEventId, setSelectedEventId] = useState(null);

  return (
    <div className="app">
      <OfflineBanner />
      {!selectedEventId ? (
        <EventTable
          planner={planner}
          onOpenSessions={
            setSelectedEventId
          } 
        />
      ) : (
        <SessionTable
          planner={planner}
          eventId={selectedEventId}
          onBack={() =>
            setSelectedEventId(null)
          }
        />
      )}
    </div>
  );
}

export default App;