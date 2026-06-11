import { Event } from "../src/model/event.js";
import { Session } from "../src/model/session.js";
import { DEFAULT_LOCATION } from "../src/model/event_location.js";

describe("Event Class", () => {

  // ---------- CREATE EVENT ----------
  test("should create a valid event", () => {
    // Arrange
    const data = {
      id: 1,
      title: "Tech Event",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T12:00",
      location: DEFAULT_LOCATION
    };

    // Act
    const event = new Event(data);

    // Assert
    expect(event.title).toBe("Tech Event");
    expect(event.sessions.length).toBe(0);
  });

  // ---------- VALIDATION ----------
  test("should throw error if title is missing", () => {
    // Arrange
    const data = {
      id: 1,
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T12:00"
    };

    // Act + Assert
    expect(() => new Event(data)).toThrow("Event title is required");
  });

  test("should throw error if endTime is before startTime", () => {
    // Arrange
    const data = {
      id: 1,
      title: "Bad Event",
      startTime: "2026-05-01T12:00",
      endTime: "2026-05-01T09:00"
    };

    // Act + Assert
    expect(() => new Event(data)).toThrow("End time must be after start time");
  });

  // ---------- ADD SESSION ----------
  test("should add a valid session", () => {
    // Arrange
    const event = new Event({
      id: 1,
      title: "Event",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T12:00"
    });

    const sessionData = {
      title: "Session 1",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T10:00"
    };

    // Act
    const session = event.addSession(sessionData);

    // Assert
    expect(event.sessions.length).toBe(1);
    expect(session.title).toBe("Session 1");
  });

  // ---------- OVERLAP ----------
  test("should not allow overlapping sessions", () => {
    // Arrange
    const event = new Event({
      id: 1,
      title: "Event",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T12:00"
    });

    event.addSession({
      title: "Session 1",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T10:00"
    });

    const overlappingSession = {
      title: "Session 2",
      startTime: "2026-05-01T09:30",
      endTime: "2026-05-01T10:30"
    };

    // Act + Assert
    expect(() => event.addSession(overlappingSession))
      .toThrow("Sessions cannot overlap");
  });

  // ---------- EVENT DURATION LIMIT ----------
  test("should not exceed event duration", () => {
    // Arrange
    const event = new Event({
      id: 1,
      title: "Event",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T10:00"
    });

    event.addSession({
      title: "Session 1",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T09:40"
    });

    const tooLongSession = {
      title: "Session 2",
      startTime: "2026-05-01T09:40",
      endTime: "2026-05-01T10:30"
    };

    // Act + Assert
    expect(() => event.addSession(tooLongSession))
      .toThrow("Sessions exceed event duration");
  });

  // ---------- SORTING ----------
  test("should sort sessions by start time", () => {
    // Arrange
    const event = new Event({
      id: 1,
      title: "Event",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T12:00"
    });

    event.addSession({
      title: "Session 2",
      startTime: "2026-05-01T10:00",
      endTime: "2026-05-01T11:00"
    });

    event.addSession({
      title: "Session 1",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T10:00"
    });

    // Act
    const sessions = event.sessions;

    // Assert
    expect(sessions[0].title).toBe("Session 1");
    expect(sessions[1].title).toBe("Session 2");
  });

  // ---------- DURATION ----------
  test("should calculate event duration correctly", () => {
    // Arrange
    const event = new Event({
      id: 1,
      title: "Event",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T10:00"
    });

    // Act
    const duration = event.getEventDuration();

    // Assert
    expect(duration).toBe(60);
  })
    // ---------- SESSION VALIDATION ----------
  test("should throw error if session end before start", async () => {
    expect(() => {
      new Session({
        title: "Bad Session",
        startTime: "2026-05-01T10:00",
        endTime: "2026-05-01T09:00"
      });
    }).toThrow("Session end must be after start");
  });


// ---------- SESSION TOSTRING ----------
  test("should return correct session string", async () => {
    const session = new Session({
      title: "Session 1",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T10:00"
    });

    const result = session.toString();

    expect(result).toContain("Session 1");
    expect(result).toContain("60");
  });
  

});