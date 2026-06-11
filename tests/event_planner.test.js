import "fake-indexeddb/auto";
import { EventPlanner } from "../src/model/event_planner.js";
import { IndexedDBRepository } from "../src/repo/indexedb_repository.js";

describe("EventPlanner", () => {

  let planner;
  let repo;

  beforeEach(async () => {
    repo = new IndexedDBRepository();
    await repo.init();

    planner = new EventPlanner(repo);
  });

  // ---------- ADD SESSION ----------
  test("should add session to event", async () => {
    const event = await planner.createEvent({
      title: "Test Event",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T10:00"
    });

    await planner.addSessionToEvent(event.id, {
      title: "Session 1",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T09:30"
    });
    await event.addSession(event.id, {
      title: "Session 2",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T09:30"
    });

    await expect(
      planner.addSessionToEvent(999, { title: "Test" })
    ).rejects.toThrow("Event not found");

    expect(event.sessions.length).toBe(2);
  });
  

  // ---------- DELETE + UNDO ----------
  test("should delete event and undo deletion", async () => {
    const event = await planner.createEvent({
      title: "Test Event",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T10:00"
    });

    await planner.deleteEvent(event.id);
    planner.undo();

    expect(planner.getEventById(event.id)).toBeDefined();
  });

  // ---------- FIND ----------
  test("should find events by location", async () => {
    const e1 = await planner.createEvent({
      title: "Event A",
      startTime: "2026-05-02T09:00",
      endTime: "2026-05-02T10:00",
      location: "Temaru"
    });

    const results = planner.findEventsByLocation("Temaru");

    expect(results.length).toBe(1);
    expect(results[0].title).toBe(e1.title);
  });

  // ---------- SORT ----------
  test("should sort events by start time", async () => {
    await planner.createEvent({
      title: "Late",
      startTime: "2026-05-03T10:00",
      endTime: "2026-05-03T12:00"
    });

    const early = await planner.createEvent({
      title: "Early",
      startTime: "2026-05-01T08:00",
      endTime: "2026-05-01T09:00"
    });

    const sorted = planner.sortEventByStartTime();

    expect(sorted[0].title).toBe(early.title);
  });

  // ---------- CALCULATION ----------
  test("should compare event durations", async () => {
    const shortEvent = await planner.createEvent({
      title: "Short",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T10:00"
    });

    const longEvent = await planner.createEvent({
      title: "Long",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T12:00"
    });

    const result = planner.getLongerEvent(shortEvent.id, longEvent.id);

    expect(result).toBe(longEvent);
  });

  // ---------- UNDO EDGE CASE ----------
  test("should throw error when undo with no history", () => {
    expect(() => planner.undo()).toThrow("Nothing to undo");
  });

 

  // ---------- UPDATE TITLE ----------
  test("should update event title", async () => {
    const event = await planner.createEvent({
      title: "Old Title",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T10:00"
    });

    const updated = await planner.updateEvent(event.id, {
      title: "New Title"
    });

    expect(updated.title).toBe("New Title");
  });

  // ---------- UPDATE MULTIPLE FIELDS ----------
  test("should update multiple fields", async () => {
    const event = await planner.createEvent({
      title: "Event",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T10:00"
    });

    const updated = await planner.updateEvent(event.id, {
      title: "Updated Event",
      startTime: "2026-05-01T08:00",
      endTime: "2026-05-01T11:00",
      location: "Riccarton"
    });

    expect(updated.title).toBe("Updated Event");
    expect(updated.location).toBe("Riccarton");
    expect(updated.getEventDuration()).toBe(180);
  });

  // ---------- UPDATE NOT FOUND ----------
  test("should throw error if event not found", async () => {
    await expect(
      planner.updateEvent(999, { title: "Test" })
    ).rejects.toThrow("Event not found");
  });

  // ---------- INVALID TITLE ----------
  test("should throw error for invalid title", async () => {
    const event = await planner.createEvent({
      title: "Valid",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T10:00"
    });

    await expect(
      planner.updateEvent(event.id, { title: "" })
    ).rejects.toThrow("Event title is required");
  });

  // ---------- INVALID TIME ----------
  test("should throw error if endTime before startTime", async () => {
    const event = await planner.createEvent({
      title: "Event",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T10:00"
    });

    await expect(
      planner.updateEvent(event.id, {
        endTime: "2026-05-01T08:00"
      })
    ).rejects.toThrow("End time must be after start time");
  });

  // ---------- UNDO UPDATE ----------
  test("should undo event update", async () => {
    const event = await planner.createEvent({
      title: "Original",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T10:00"
    });

    await planner.updateEvent(event.id, {
      title: "Changed"
    });

    planner.undo();

    const reverted = planner.getEventById(event.id);

    expect(reverted.title).toBe("Original");
  });

  // ---------- DB PERSISTENCE ----------
  test("should persist updated event to repository", async () => {
    const event = await planner.createEvent({
      title: "Old",
      startTime: "2026-05-01T09:00",
      endTime: "2026-05-01T10:00"
    });

    await planner.updateEvent(event.id, {
      title: "Updated"
    });

    const stored = await repo.getById(event.id);

    expect(stored.title).toBe("Updated");
  });

});