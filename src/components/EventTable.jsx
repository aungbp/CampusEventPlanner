import { useEffect, useState } from "react";

// import { EventPlanner } from "../model/event_planner";
// import { IndexedDBRepository } from "../repo/indexedb_repository";

import EventForm from "./EventForm";

// const repository = new IndexedDBRepository();
// const planner = new EventPlanner(repository);

function EventTable({ planner, onOpenSessions }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingEventId, setEditingEventId] = useState(null);

  // Retrieve events from the planner
  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    await planner.loadEvents();
    setEvents([...planner.getAllEvents()]);
  }

  // Create a new event
  async function handleCreate(data) {
    try {
      await planner.createEvent(data);

      await loadEvents();

      setShowForm(false);
    } catch (err) {
      alert(err.message);
    }
  }

  // Update an existing event
  async function handleUpdate(data) {
    try {
      await planner.updateEvent(editingEventId, data);

      await loadEvents();

      setEditingEventId(null);
    } catch (err) {
      alert(err.message);
    }
  }

    // Delete an event
  async function handleDelete(id) {
    try {
      await planner.deleteEvent(id);

      await loadEvents();
    } catch (err) {
      alert(err.message);
    }
  }

  // Undo the most recent action
  async function handleUndo() {
    try {
      await planner.undo();

      await loadEvents();
    } catch (err) {
      alert(err.message);
    }
  }

   // Search events by title or location
  function handleSearch(value) {
    setSearch(value);

    if (!value) {
      setEvents([...planner.getAllEvents()]);
      return;
    }

    const byName = planner.findEventsByName(value);

    const byLocation = planner.findEventsByLocation(value);

    const merged = [...new Set([...byName, ...byLocation])];

    setEvents(merged);
  }

    // Sort events by start time
  function sortByStartTime() {
    setEvents([...planner.sortEventByStartTime()]);
  }

    // Sort events alphabetically by location
  function sortByLocation() {
    setEvents([...planner.sortEventsByLocation()]);
  }

  return (
    <div>
      <h1>Event Planner</h1>
      {/* Search and create controls */}
      <div className="top-bar">
        <input
          type="text"
          placeholder="Search event"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <button onClick={() => setShowForm(true)}>Create</button>
      </div>

    {/* Event sorting options */}
      <div className="sort-bar">
        <button onClick={sortByStartTime}>Sort By Start Time</button>

        <button onClick={sortByLocation}>Sort By Location</button>
      </div>

    {/* Display create/edit event form */}
      {(showForm || editingEventId) && (
        <EventForm
          event={events.find((e) => e.id === editingEventId)}
          onSubmit={editingEventId ? handleUpdate : handleCreate}
          onClose={() => {
            setShowForm(false);
            setEditingEventId(null);
          }}
        />
      )}

      {/* Event data table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Duration</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {events.map((event, index) => (
            <tr key={index + 1}>
              <td>{index + 1}</td>

            {/* Opening session management page */}
              <td>
                <button
                  className="link-btn"
                  onClick={() => onOpenSessions(event.id)}
                >
                  {event.title}
                </button>
              </td>

              <td>{event.startTime.toLocaleString()}</td>

              <td>{event.endTime.toLocaleString()}</td>

            {/* Display event duration in hours and minutes */} 
              <td>
                {Math.floor(event.getEventDuration() / 60)}hr{" "}
                {event.getEventDuration() % 60 !== 0 &&
                  `${event.getEventDuration() % 60}min`}
              </td>

              <td>{event.location}</td>
                  {/* Edit and delete actions */}
              <td>
                <button onClick={() => setEditingEventId(event.id)}>
                  Edit
                </button>

                <button onClick={() => handleDelete(event.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

          {/* Restore the previous action */}
      <button onClick={handleUndo}>Undo</button>
    </div>
  );
}

export default EventTable;
