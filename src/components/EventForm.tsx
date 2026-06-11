import { useState } from "react";

import {
  EVENT_LOCATIONS,
  DEFAULT_LOCATION,
} from "../model/event_location";

import type {
  EventData,
} from "../types/event";

interface EventFormProps {
  event?: EventData;

  onSubmit: (
    data: EventData
  ) => void;

  onClose: () => void;
}

function EventForm({
  event,
  onSubmit,
  onClose,
}: EventFormProps) {

  const [title, setTitle] =
    useState<string>(
      event?.title || ""
    );

  const [startTime, setStartTime] =
    useState<string>(
      event?.startTime
        ? formatDateTime(
            event.startTime
          )
        : ""
    );

  const [endTime, setEndTime] =
    useState<string>(
      event?.endTime
        ? formatDateTime(
            event.endTime
          )
        : ""
    );

  const [location, setLocation] =
    useState<string>(
      event?.location ||
      DEFAULT_LOCATION
    );

    // Convert date values into a format
  function formatDateTime(
    dateValue: string | Date
  ): string {

    const date =
      new Date(dateValue);

    const year =
      date.getFullYear();

    const month =
      String(date.getMonth() + 1)
        .padStart(2, "0");

    const day =
      String(date.getDate())
        .padStart(2, "0");

    const hours =
      String(date.getHours())
        .padStart(2, "0");

    const minutes =
      String(date.getMinutes())
        .padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Handle form submission
  function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ): void {

    e.preventDefault();

    onSubmit({
      title,
      startTime,
      endTime,
      location,
    });
  }

  return (
    <div className="modal">

      <form
        className="form"
        onSubmit={handleSubmit}
      >

        <h2>
          {event
            ? "Edit Event"
            : "Create Event"}
        </h2>

        <input
          type="text"
          placeholder="Event title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
        />

        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) =>
            setStartTime(e.target.value)
          }
          required
        />

        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) =>
            setEndTime(e.target.value)
          }
          required
        />

        <select
          value={location}
          onChange={(e) =>
            setLocation(e.target.value)
          }
        >

          {EVENT_LOCATIONS.map((loc) => (

            <option
              key={loc}
              value={loc}
            >
              {loc}
            </option>

          ))}

        </select>

        <div className="button-group">

          <button type="submit">
            Submit
          </button>

          <button
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  );
}

export default EventForm;