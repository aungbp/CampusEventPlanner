import { useState, useEffect } from "react";
import SessionForm from "./SessionForm";

function SessionTable({ planner, eventId, onBack }) {
  const event = planner.getEventById(eventId);

  // Display message if event does not exist
  if (!event) {
    return <div>Event not found</div>;
  }

  const [sessions, setSessions] = useState([...event.sessions]);

  const [showForm, setShowForm] = useState(false);

  const [editingIndex, setEditingIndex] = useState(null);

  // Load sessions when component first renders
  useEffect(() => {
    loadSessions();
  }, []);

   // Retrieve sessions from storage
  async function loadSessions() {
    await planner.loadSessions(eventId);

    setSessions([...event.sessions]);
  }

  // Create a new session
  async function handleCreate(data) {
    try {
      await planner.addSessionToEvent(eventId, data);

      await loadSessions();

      setShowForm(false);
    } catch (err) {
      alert(err.message);
    }
  }

  // Update an existing session
  async function handleUpdate(data) {
    try {
      await planner.updateSession(eventId, editingIndex, data);

      await loadSessions();

      setEditingIndex(null);
    } catch (err) {
      alert(err.message);
    }
  }

   // Delete a session
  async function handleDelete(index) {
    await planner.deleteSession(eventId, index);

    await loadSessions();
  }

  // Undo the most recent action
  async function handleUndo() {
    try {
      await planner.undo();

      const updatedEvent = planner.getEventById(eventId);

      setSessions([...updatedEvent.sessions]);
    } catch (err) {
      alert(err.message);
    }
  }

   // Sort sessions by start time
  function sortByStartTime() {
    event.sortSessionByStartTime();

    setSessions([...event.sessions]);
  }

  // Sort sessions alphabetically by title
  function sortByName() {
    event.sortSessionsByName();

    setSessions([...event.sessions]);
  }

   // Calculate total duration of all sessions
  const totalMinutes = sessions.reduce(
    (sum, session) => sum + session.getDurationMinutes(),
    0,
  );

  return (
    <div>
      <button onClick={onBack}>Back</button>

      <h2>{event.title} Sessions</h2>

    {/* Session creation controls */}
      <div className="top-bar">
        <button onClick={() => setShowForm(true)}>Create Session</button>
      </div>

    {/* Session sorting options */}
      <div className="sort-bar">
        <button onClick={sortByStartTime}>Sort By Start Time</button>

        <button onClick={sortByName}>Sort By Name</button>
      </div>

     {/* Display create/edit session form */}
      {(showForm || editingIndex !== null) && (
        <SessionForm
          session={sessions.find((e) => e.id === editingIndex)}
          onSubmit={editingIndex ? handleUpdate : handleCreate}
          onClose={() => {
            setShowForm(false);
            setEditingIndex(null);
          }}
        />
      )}

      {/* Session data table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {sessions.map((session, index) => {
            
            const minutes = session.getDurationMinutes();

            const hours = Math.floor(minutes / 60);

            const remainingMinutes = minutes % 60;

            return (
              <tr key={index + 1}>
                <td>{index + 1}</td>

                <td>{session.title}</td>

                <td>{session.startTime.toLocaleString()}</td>

                <td>{session.endTime.toLocaleString()}</td>

                <td>
                  {hours > 0 && `${hours}hr `}

                  {remainingMinutes > 0 && `${remainingMinutes}min`}
                </td>

                <td>
                  <button onClick={() => setEditingIndex(session.id)}>
                    Edit
                  </button>

                  <button onClick={() => handleDelete(session.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="total-duration">
        Total Duration: {Math.floor(totalMinutes / 60)}hr{" "}
        {totalMinutes % 60 !== 0 && `${totalMinutes % 60}min`}
      </div>

      <button onClick={handleUndo}>Undo</button>
    </div>
  );
}

export default SessionTable;
