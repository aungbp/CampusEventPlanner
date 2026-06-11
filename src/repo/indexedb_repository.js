import { RepositoryContract } from "./repository_contract.js";

export class IndexedDBRepository extends RepositoryContract {
  #dbName = "EventPlannerDB";
  #dbVersion = 1;
  #db = null;

  constructor(repository) {
    super();
  }

  async init() {
    if (this.#db) return;

    this.#db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.#dbName, this.#dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Events table
        if (!db.objectStoreNames.contains("events")) {
          db.createObjectStore("events", {
            keyPath: "id",
            autoIncrement: true,
          });
        }

        // Sessions table
        if (!db.objectStoreNames.contains("sessions")) {
          const sessionStore = db.createObjectStore("sessions", {
            keyPath: "id",
            autoIncrement: true,
          });

          // link session to event
          sessionStore.createIndex("eventId", "eventId", { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async #getStore(storeName, mode = "readonly") {
    await this.init();
    const tx = this.#db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  // ---------- EVENT METHODS ----------

  async add(item, storeName = "events") {
    const store = await this.#getStore(storeName, "readwrite");

    return new Promise((resolve, reject) => {
      const request = store.add(item);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getById(id, storeName = "events") {
    const store = await this.#getStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName = "events") {
    const store = await this.#getStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update(item, storeName = "events") {
    const store = await this.#getStore(storeName, "readwrite");

    return new Promise((resolve, reject) => {
      const request = store.put(item);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async remove(id, storeName = "events") {
    const store = await this.#getStore(storeName, "readwrite");

    return new Promise((resolve, reject) => {
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // ---------- SESSION METHODS ----------

  async addSession(eventId, sessionData) {
    const store = await this.#getStore("sessions", "readwrite");

    const session = {
      ...sessionData,
      eventId,
    };

    return new Promise((resolve, reject) => {
      const request = store.add(session);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateSession(sessionData) {
    const store = await this.#getStore("sessions", "readwrite");

    return new Promise((resolve, reject) => {
      const request = store.put(sessionData);

      request.onsuccess = () => resolve(true);

      request.onerror = () => reject(request.error);
    });
  }

  async getSessionsByEvent(eventId) {
    const store = await this.#getStore("sessions");
    const index = store.index("eventId");

    return new Promise((resolve, reject) => {
      const request = index.getAll(eventId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSession(sessionId) {
    const store = await this.#getStore("sessions", "readwrite");

    return new Promise((resolve, reject) => {
      const request = store.delete(sessionId);

      request.onsuccess = () => resolve(true);

      request.onerror = () => reject(request.error);
    });
  }

  async restoreSession(sessionData) {
    const store = await this.#getStore("sessions", "readwrite");

    return new Promise((resolve, reject) => {
      const request = store.put(sessionData);

      request.onsuccess = () => resolve(true);

      request.onerror = () => reject(request.error);
    });
  }
}
