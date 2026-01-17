import { dateRangesOverlap, timeRangesOverlap } from "./date";
import type { EventBooking } from "../types/database";

/**
 * Check if a new/updated event conflicts with existing events
 */
export function checkEventConflict(
  newEvent: {
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    id?: string; // Exclude this event when checking conflicts
  },
  existingEvents: EventBooking[]
): EventBooking | null {
  for (const event of existingEvents) {
    // Skip the event being edited
    if (newEvent.id && event.id === newEvent.id) {
      continue;
    }

    // Check if date ranges overlap
    if (
      dateRangesOverlap(
        newEvent.start_date,
        newEvent.end_date,
        event.start_date,
        event.end_date
      )
    ) {
      // If dates overlap, check if times overlap
      if (
        timeRangesOverlap(
          newEvent.start_time,
          newEvent.end_time,
          event.start_time,
          event.end_time
        )
      ) {
        return event;
      }
    }
  }

  return null;
}
