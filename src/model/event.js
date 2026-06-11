import { Session } from "./session.js";
import { EVENT_LOCATIONS, DEFAULT_LOCATION } from "./event_location.js";

export class Event {
  #id;
  #title;
  #startTime;
  #endTime;
  #location;
  #sessions;

  constructor({ id, title, startTime, endTime, location = DEFAULT_LOCATION }) {
    this.#id = id;
    this.#title = title;

    this.#startTime = new Date(startTime);
    this.#endTime = new Date(endTime);

    this.#location = location;
    this.#sessions = [];

    this.validate();
  }

  get id() {
    return this.#id;
  }
  set id(value) {
    this.#id = value;
  }

  get title() {
    return this.#title;
  }
  set title(value) {
    if (!value) throw new Error("Event title is required");
    this.#title = value;
  }

  get startTime() {
    return this.#startTime;
  }
  set startTime(value) {
    this.#startTime = new Date(value);
    this.validate();
  }
  get endTime() {
    return this.#endTime;
  }
  set endTime(value) {
    this.#endTime = new Date(value);
    this.validate();
  }
  get location() {
    return this.#location;
  }
  set location(value) {
    if (!EVENT_LOCATIONS.includes(value)) {
      throw new Error("Invalid event location");
    }
    this.#location = value;
  }
  get sessions() {
    return this.#sessions;
  }
  set sessions(sessions) {
    this.#sessions = sessions;
  }

  validate() {
    if (!this.#title) {
      throw new Error("Event title is required");
    }

    if (!EVENT_LOCATIONS.includes(this.#location)) {
      throw new Error("Invalid event location");
    }

    if (this.#endTime <= this.#startTime) {
      throw new Error("End time must be after start time");
    }
  }

  addSession(data) {
    const session = new Session(data);

    for (let s of this.#sessions) {
      const overlap =
        session.startTime < s.endTime && session.endTime > s.startTime;

      if (overlap) {
        throw new Error("Sessions cannot overlap");
      }
    }

    if (this.#sessions.length === 0 && session.startTime < this.startTime) {
      throw new Error("First session cannot start before event start time");
    }

    const total = this.getTotalSessionDuration() + session.getDurationMinutes();

    if (total > this.getEventDuration()) {
      throw new Error("Sessions exceed event duration");
    }

    this.#sessions.push(session);
    this.sortSessionByStartTime();
    return session;
  }

  restoreSession(sessionData) {
    const session = new Session(sessionData);

    this.#sessions.push(session);

    return session;
  }

  updateSession(sessionId, newData) {
    const session = this.getSessionById(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    if (newData.title !== undefined) {
      session.title = newData.title;
    }

    if (newData.startTime !== undefined) {
      session.startTime = new Date(newData.startTime);
    }

    if (newData.endTime !== undefined) {
      session.endTime = new Date(newData.endTime);
    }

    session.validate();

    return session;
  }

  deleteSession(sessionId) {
    const session = this.getSessionById(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    this.#sessions = this.#sessions.filter((s) => s.id !== sessionId);
  }

  sortSessionByStartTime() {
    return this.#sessions.sort((a, b) => a.startTime - b.startTime);
  }

  sortSessionsByName() {
    return this.#sessions.sort((a, b) => a.title.localeCompare(b.title));
  }

  // ✅ FIXED (no new Date wrapping)
  getEventDuration() {
    return (this.endTime - this.startTime) / 60000;
  }

  getSessionById(sessionId) {
    return this.#sessions.find((s) => s.id === sessionId);
  }

  getTotalSessionDuration() {
    return this.sessions.reduce((total, s) => {
      return total + s.getDurationMinutes();
    }, 0);
  }

  toPlainObject() {
    const data = {
      title: this.#title,
      startTime: this.#startTime,
      endTime: this.#endTime,
      location: this.#location,
    };

    if (this.#id !== null && this.#id !== undefined) {
      data.id = this.#id;
    }

    return data;
  }
}
