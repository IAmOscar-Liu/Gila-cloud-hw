import { TranscriptClip } from "../types/Transcript";

export function findCurrentChipsAt(
  oldChips: TranscriptClip[],
  currentTime: number,
) {
  let left = 0;
  let right = oldChips.length - 1;

  while (left <= right) {
    // console.log("findCurrentChipsAt");
    const mid = Math.floor((left + right) / 2);
    if (
      oldChips[mid].startAt <= currentTime &&
      currentTime < oldChips[mid].startAt + oldChips[mid].duration
    ) {
      return mid;
    } else if (currentTime < oldChips[mid].startAt) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return oldChips.length - 1;
}
