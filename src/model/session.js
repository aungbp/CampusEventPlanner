export class Session {
  #id;
  #title;
  #startTime;
  #endTime;
  #eventId;
  constructor({ id, eventId, title, startTime, endTime }) {
    this.#id = id;
    this.#title = title;
    this.#startTime = new Date(startTime);
    this.#endTime = new Date(endTime);
    this.#eventId = eventId;

    this.validate();
  }
  get id() {
    return this.#id;
  }
  set id(value) {
    this.#id = value;
  }
  get eventId() {
    return this.#eventId;
  }
  set eventId(value) {
    this.#eventId = value;
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

  validate() {
    if (this.endTime <= this.startTime) {
      throw new Error("Session end must be after start");
    }
  }

  getDurationMinutes() {
    return (new Date(this.endTime) - new Date(this.startTime)) / 60000;
  }
  toString() {
    return `${this.id}: ${this.title}(duration: ${this.getDurationMinutes()}min)`;
  }

  toPlainObject() {
    const data = {
      title: this.#title,

      startTime: this.#startTime,

      endTime: this.#endTime,

      eventId: this.#eventId,
    };

    if (this.#id !== null && this.#id !== undefined) {
      data.id = this.#id;
    }

    return data;
  }
}
