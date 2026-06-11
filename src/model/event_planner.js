import { Event } from "./event.js";
import { Session } from "./session.js";

export class EventPlanner {
  #events;
  #history;
  #repository;

  constructor(repository) {
    this.#repository = repository;
    this.#events = [];
    this.#history = [];
  }

  async createEvent(data) {
    this.saveState();

    const event = new Event({
      id: null,
      ...data,
    });

    let newId;

    try {
      newId = this.#repository
        ? await this.#repository.add(event.toPlainObject())
        : Date.now();
    } catch (err) {
      throw new Error("Failed to save event",err);
    }

    event.id = newId;

    this.#events.push(event);
    this.sortEventByStartTime();

    return event;
  }

  async addSessionToEvent(eventId, sessionData) {
    const event = this.getEventById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    this.saveState();

    const session = event.addSession(sessionData);
    session.eventId = eventId;

    if (this.#repository) {
      const id = await this.#repository.addSession(
        eventId,
        session.toPlainObject(),
      );
      session.id = id;
    }

    return session;
  }

  // Update Event
  async updateEvent(id, newData) {
    const event = this.getEventById(id);
    if (!event) throw new Error("Event not found");

    this.saveState();

    if (newData.title !== undefined) event.title = newData.title;
    if (newData.startTime !== undefined) event.startTime = newData.startTime;
    if (newData.endTime !== undefined) event.endTime = newData.endTime;
    if (newData.location !== undefined) event.location = newData.location;

    // persist to DB if repo exists
    if (this.#repository) {
      await this.#repository.update(event.toPlainObject());
    }

    return event;
  }

  // Delete Event
  async deleteEvent(id) {
    this.saveState();

    this.#events = this.#events.filter((e) => e.id !== id);

    if (this.#repository) {
      await this.#repository.remove(id);
    }
  }

  // Update Session
  async updateSession(eventId, sessionIndex, newData) {
    const event = this.getEventById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    this.saveState();

    const session = event.updateSession(sessionIndex, newData);

    if (this.#repository) {
      await this.#repository.updateSession(session.toPlainObject());
    }

    return session;
  }

  // Delete Session
  async deleteSession(eventId, sessionIndex) {
    const event = this.getEventById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    this.saveState();

    event.deleteSession(sessionIndex);

    if (this.#repository) {
      await this.#repository.deleteSession(sessionIndex);
    }
  }

  // Event Loading
  async loadEvents() {
    if (!this.#repository) return [];

    const items = await this.#repository.getAll();

    this.#events = items.map((item) => new Event(item));

    return this.#events;
  }

  // Session Loading
  async loadSessions(eventId) {
    if (!this.#repository) {
      return [];
    }

    const items = await this.#repository.getSessionsByEvent(eventId);

    const event = this.getEventById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    const sessions = items.map((item) => new Session(item));

    event.sessions = sessions;

    return event.sessions;
  }

  // Save State
  saveState() {
    const snapshot = this.#events.map((e) => ({
      id: e.id,
      title: e.title,
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location,
      sessions: e.sessions.map((s) => ({
        id: s.id,
        title: s.title,
        startTime: s.startTime,
        endTime: s.endTime,
        eventId: s.eventId,
      })),
    }));

    this.#history.push(snapshot);
  }

  // Undo
  async undo() {
    if (this.#history.length === 0) {
      throw new Error("Nothing to undo");
    }

    // CURRENT STATE (before undo)
    const currentEvents = this.#events;

    const currentSessions = currentEvents.flatMap((e) => e.sessions);

    // SNAPSHOT
    const snapshot = this.#history.pop();

    // Restore Event
    this.#events = snapshot.map((e) => {
      const event = new Event({
        id: e.id,

        title: e.title,

        startTime: e.startTime,

        endTime: e.endTime,

        location: e.location,
      });

      // Restore Sessions
      if (e.sessions) {
        e.sessions.forEach((s) => {
          event.restoreSession({
            id: s.id,

            title: s.title,

            startTime: s.startTime,

            endTime: s.endTime,

            eventId: s.eventId,
          });
        });
      }

      return event;
    });

    const restoredEvents = this.#events;

    const restoredSessions = restoredEvents.flatMap((e) => e.sessions);

    // DATABASE SYNC
    if (this.#repository) {

      // DELETE EVENTS(undo)
      const deletedEvents = currentEvents.filter(
        (current) =>
          !restoredEvents.find((restored) => restored.id === current.id),
      );

      for (const event of deletedEvents) {
        await this.#repository.remove(event.id);
      }

      // RESTORE EVENTS(undo)
      const addedEvents = restoredEvents.filter(
        (restored) =>
          !currentEvents.find((current) => current.id === restored.id),
      );

      for (const event of addedEvents) {
        await this.#repository.add(event.toPlainObject());
      }

      // UPDATE EVENTS(undo)
      const updatedEvents = restoredEvents.filter((restored) => {
        const current = currentEvents.find((e) => e.id === restored.id);

        if (!current) {
          return false;
        }

        return (
          current.title !== restored.title ||
          current.location !== restored.location ||
          current.startTime.getTime() !== restored.startTime.getTime() ||
          current.endTime.getTime() !== restored.endTime.getTime()
        );
      });

      for (const event of updatedEvents) {
        await this.#repository.update(event.toPlainObject());
      }
      // SESSIONS
      // DELETE SESSIONS(undo)
      const deletedSessions = currentSessions.filter(
        (current) =>
          !restoredSessions.find((restored) => restored.id === current.id),
      );

      for (const session of deletedSessions) {
        await this.#repository.deleteSession(session.id);
      }
      // RESTORE SESSIONS(undo)
      // --------------------------------
      const addedSessions = restoredSessions.filter(
        (restored) =>
          !currentSessions.find((current) => current.id === restored.id),
      );

      for (const session of addedSessions) {
        await this.#repository.restoreSession(
          session.toPlainObject(),
        );
      }

      // UPDATE SESSIONS(undo)
      // --------------------------------
      const updatedSessions = restoredSessions.filter((restored) => {
        const current = currentSessions.find((s) => s.id === restored.id);

        if (!current) {
          return false;
        }

        return (
          current.title !== restored.title ||
          current.startTime.getTime() !== restored.startTime.getTime() ||
          current.endTime.getTime() !== restored.endTime.getTime()
        );
      });

      for (const session of updatedSessions) {
        await this.#repository.updateSession(session.toPlainObject());
      }
    }
  }

  getEventById(id) {
    return this.#events.find((e) => e.id === id);
  }

  findEventsByLocation(location) {
    return this.#events.filter((e) => e.location === location);
  }

  findEventsByName(name) {
    return this.#events.filter((e) =>
      e.title.toLowerCase().includes(name.toLowerCase()),
    );
  }

  sortEventsByLocation() {
    this.#events.sort((a, b) => a.location.localeCompare(b.location));

    return this.#events;
  }

  
  sortEventByStartTime() {
    this.#events.sort((a, b) => a.startTime - b.startTime);
    return this.#events;
  }

  getAllEvents() {
    return this.sortEventByStartTime();
  }

  getLongerEvent(id1, id2) {
    const event1 = this.getEventById(id1);
    const event2 = this.getEventById(id2);

    if (!event1 || !event2) {
      throw new Error("Event not found");
    }

    return event1.getEventDuration() >= event2.getEventDuration()
      ? event1
      : event2;
  }
}
