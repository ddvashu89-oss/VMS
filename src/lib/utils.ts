import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeString(timeStr: string | null | undefined): string {
  if (!timeStr) return "—";
  
  // If it's a full ISO string (contains T or -), parse it
  if (timeStr.includes("T") || (timeStr.includes("-") && timeStr.split("-").length > 2)) {
    try {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      }
    } catch (e) {
      // ignore and fallback
    }
  }

  const cleanTime = timeStr.trim();
  
  // If it already has AM/PM, format it to strip leading zeros if necessary
  if (cleanTime.toUpperCase().includes("AM") || cleanTime.toUpperCase().includes("PM")) {
    const parts = cleanTime.split(":");
    if (parts.length >= 2) {
      let hoursStr = parts[0].trim();
      // Remove leading zero if present
      if (hoursStr.startsWith("0") && hoursStr.length > 1) {
        hoursStr = hoursStr.substring(1);
      }
      return `${hoursStr}:${parts.slice(1).join(":")}`;
    }
    return cleanTime;
  }
  
  const parts = cleanTime.split(":");
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].slice(0, 2); // get just the 2 digits of minutes
    if (!isNaN(hours) && hours >= 0 && hours < 24) {
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    }
  }
  
  return cleanTime;
}
