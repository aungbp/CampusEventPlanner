import "fake-indexeddb/auto";
import { IndexedDBRepository } from "../src/repo/indexedb_repository";

describe("IndexedDBRepository", () => {

  let repo;

  beforeEach(async () => {    
  repo = new IndexedDBRepository();
  await repo.init();
});


  // ---------- EVENT TESTS ----------

  test("should get all events", async () => {
    await repo.add({ title: "Event 1" });
    await repo.add({ title: "Event 2" });

    const results = await repo.getAll();

    expect(results.length).toBe(2);
  });

  test("should add and get event by id", async () => {
    const event = {
      title: "Test Event",
      startTime: new Date(),
      endTime: new Date(),
      location: "Test"
    };

    const id = await repo.add(event);
    const result = await repo.getById(id);

    expect(result.title).toBe("Test Event");
  });



  test("should update event", async () => {
    const id = await repo.add({ title: "Old Title" });

    await repo.update({
      id,
      title: "New Title"
    });

    const updated = await repo.getById(id);

    expect(updated.title).toBe("New Title");
  });


  test("should delete event", async () => {
    const id = await repo.add({ title: "Delete Me" });

    await repo.remove(id);
    const result = await repo.getById(id);

    expect(result).toBeUndefined();
  });


  // ---------- SESSION TESTS ----------

  test("should add session to event", async () => {
    const eventId = await repo.add({ title: "Event" });

    const sessionId = await repo.addSession(eventId, {
      title: "Session 1"
    });

    expect(sessionId).toBeDefined();
  });


  test("should get sessions by event", async () => {
    const eventId = await repo.add({ title: "Event" });

    await repo.addSession(eventId, { title: "Session 1" });
    await repo.addSession(eventId, { title: "Session 2" });

    const sessions = await repo.getSessionsByEvent(eventId);

    expect(sessions.length).toBe(2);
  });


  test("should delete sessions by event", async () => {
    const eventId = await repo.add({ title: "Event" });

    await repo.addSession(eventId, { title: "Session 1" });
    await repo.addSession(eventId, { title: "Session 2" });

    await repo.deleteSessionsByEvent(eventId);

    const sessions = await repo.getSessionsByEvent(eventId);

    expect(sessions.length).toBe(0);
  });

});