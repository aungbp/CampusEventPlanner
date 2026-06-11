import { useState } from "react";

import type {
  SessionData,
} from "../types/session";

interface SessionFormProps {
  session?: SessionData;

  onSubmit: (
    data: SessionData
  ) => void;

  onClose: () => void;
}

function SessionForm({
  session,
  onSubmit,
  onClose,
}: SessionFormProps) {

  const [title, setTitle] =
    useState<string>(
      session?.title || ""
    );

  const [startTime, setStartTime] =
    useState<string>(
      session?.startTime
        ? formatDateTime(
            session.startTime
          )
        : ""
    );

  const [endTime, setEndTime] =
    useState<string>(
      session?.endTime
        ? formatDateTime(
            session.endTime
          )
        : ""
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
    });
  }

  return (
    <div className="modal">

      <form
        className="form"
        onSubmit={handleSubmit}
      >

        <h2>
          {session
            ? "Edit Session"
            : "Create Session"}
        </h2>

            {/* Session title input */}
        <input
          type="text"
          placeholder="Session title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
        />

          {/* Session start date and time */}
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) =>
            setStartTime(e.target.value)
          }
          required
        />

          {/* Session end date and time */}
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) =>
            setEndTime(e.target.value)
          }
          required
        />

           {/* Form action buttons */}
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

export default SessionForm;