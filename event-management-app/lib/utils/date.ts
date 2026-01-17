import { format, parse, isSameDay, isAfter, isBefore, addDays, isValid } from "date-fns";

export function formatDate(date: string | Date): string {
  if (!date) return "Invalid date";
  try {
    return format(new Date(date), "MMM dd, yyyy");
  } catch {
    return "Invalid date";
  }
}

export function formatTime(time: string | null | undefined): string {
  if (!time || typeof time !== "string" || time.trim() === "") {
    return "N/A";
  }
  
  const timeStr = time.trim();
  
  try {
    // Handle different time formats from database
    // PostgreSQL TIME returns "HH:mm:ss" or "HH:mm:ss.sss" format
    // Extract just the HH:mm part if seconds are present
    let timeToParse = timeStr;
    
    // If it has seconds (contains more than one colon or has format HH:mm:ss)
    if (timeStr.split(":").length >= 3) {
      // Extract HH:mm part (first 5 characters)
      timeToParse = timeStr.substring(0, 5);
    }
    
    // Parse the time
    const parsed = parse(timeToParse, "HH:mm", new Date());
    
    if (!isValid(parsed)) {
      // If parsing failed, try to extract hours and minutes manually
      const parts = timeStr.split(":");
      if (parts.length >= 2) {
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);
          return format(date, "h:mm a");
        }
      }
      return "Invalid time";
    }
    
    return format(parsed, "h:mm a");
  } catch (error) {
    // Fallback: try to extract and format manually
    try {
      const parts = timeStr.split(":");
      if (parts.length >= 2) {
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);
          return format(date, "h:mm a");
        }
      }
    } catch {
      // Ignore fallback errors
    }
    return "Invalid time";
  }
}

export function formatDateTime(date: string, time: string): string {
  return `${formatDate(date)} at ${formatTime(time)}`;
}

export function getDateRange(startDate: string, endDate: string): string {
  if (startDate === endDate) {
    return formatDate(startDate);
  }
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function getTimeRange(startTime: string | null | undefined, endTime: string | null | undefined): string {
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  
  if (start === "N/A" && end === "N/A") {
    return "Time not specified";
  }
  
  return `${start} - ${end}`;
}

/**
 * Check if two time ranges overlap
 */
export function timeRangesOverlap(
  start1: string | null | undefined,
  end1: string | null | undefined,
  start2: string | null | undefined,
  end2: string | null | undefined
): boolean {
  if (!start1 || !end1 || !start2 || !end2) {
    return false;
  }
  
  try {
    const s1 = parse(start1, "HH:mm", new Date());
    const e1 = parse(end1, "HH:mm", new Date());
    const s2 = parse(start2, "HH:mm", new Date());
    const e2 = parse(end2, "HH:mm", new Date());

    if (!isValid(s1) || !isValid(e1) || !isValid(s2) || !isValid(e2)) {
      return false;
    }

    return s1 < e2 && s2 < e1;
  } catch {
    return false;
  }
}

/**
 * Get all dates between start and end date (inclusive)
 */
export function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let current = start;

  while (current <= end) {
    dates.push(format(current, "yyyy-MM-dd"));
    current = addDays(current, 1);
  }

  return dates;
}

/**
 * Check if two date ranges overlap
 */
export function dateRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);

  return s1 <= e2 && s2 <= e1;
}
