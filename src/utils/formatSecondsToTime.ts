export function formatSecondsToTime(seconds: number | undefined) {
  if (seconds === undefined) return "00:00";

  seconds = Math.floor(seconds);

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = secs.toString().padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = secs.toString().padStart(2, "0");

    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }
}
