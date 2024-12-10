import { Transcript, TranscriptClip } from "../types/Transcript";
import { formatSecondsToTime } from "./formatSecondsToTime";

export function processTranscript(
  data: Record<string, Transcript[]>,
  total: number,
) {
  // This ensures that the length of video is always shorter than transcript
  total += 0.01;

  const result: Map<string, Transcript[]> = new Map();

  if (total <= 5) {
    result.set("Introduction", [
      {
        ...data["Introduction"][0],
        startAt: 0,
        duration: total,
        highlighted: false,
      },
    ]);
    return result;
  }

  const newData: Record<string, Transcript[]> = {};
  // let duration = Math.floor(total / 5) * 5;
  let duration = total;

  while (
    data["Introduction"].length > 0 &&
    duration >= data["Introduction"][0].duration
  ) {
    if (newData["Introduction"] === undefined) newData["Introduction"] = [];
    duration -= data["Introduction"][0].duration;
    newData["Introduction"].push(data["Introduction"].shift()!);
  }

  while (
    data["Conclusion"].length > 0 &&
    duration >= data["Conclusion"][data["Conclusion"].length - 1].duration
  ) {
    if (newData["Conclusion"] === undefined) newData["Conclusion"] = [];
    duration -= data["Conclusion"][data["Conclusion"].length - 1].duration;
    newData["Conclusion"].unshift(data["Conclusion"].pop()!);
  }

  while (
    data["Key Features"].length > 0 &&
    duration >= data["Key Features"][0].duration
  ) {
    if (newData["Key Features"] === undefined) newData["Key Features"] = [];
    duration -= data["Key Features"][0].duration;
    newData["Key Features"].push(data["Key Features"].shift()!);
  }

  while (
    data["Demonstration"].length > 0 &&
    duration >= data["Demonstration"][0].duration
  ) {
    if (newData["Demonstration"] === undefined) newData["Demonstration"] = [];
    duration -= data["Demonstration"][0].duration;
    newData["Demonstration"].push(data["Demonstration"].shift()!);
  }

  // console.log("duration: ", duration);
  if (duration >= 5) {
    let i = 0;
    while (i < Math.floor(duration / 5) * 5) {
      if (newData["Dynamic content"] === undefined)
        newData["Dynamic content"] = [];
      newData["Dynamic content"].push({
        startAt: 0,
        duration: 5,
        content: `Dynamic content from ${formatSecondsToTime(
          60 + i,
        )} to ${formatSecondsToTime(60 + i + 5)}`,
        highlighted: false,
      });
      i += 5;
    }
  }

  let current = 0;
  if (newData["Introduction"]) {
    for (let el of newData["Introduction"]) {
      el.startAt = current;
      current += el.duration;
    }
    result.set("Introduction", newData["Introduction"]);
  }
  if (newData["Key Features"]) {
    for (let el of newData["Key Features"]) {
      el.startAt = current;
      current += el.duration;
    }
    result.set("Key Features", newData["Key Features"]);
  }
  if (newData["Demonstration"]) {
    for (let el of newData["Demonstration"]) {
      el.startAt = current;
      current += el.duration;
    }
    result.set("Demonstration", newData["Demonstration"]);
  }
  if (newData["Dynamic content"]) {
    for (let el of newData["Dynamic content"]) {
      el.startAt = current;
      current += el.duration;
    }
    result.set("Dynamic content", newData["Dynamic content"]);
  }
  if (newData["Conclusion"]) {
    for (let el of newData["Conclusion"]) {
      el.startAt = current;
      current += el.duration;
    }
    result.set("Conclusion", newData["Conclusion"]);
  }

  const last =
    newData["Conclusion"] ??
    newData["Dynamic content"] ??
    newData["Demonstration"] ??
    newData["Key Features"] ??
    newData["Introduction"];
  last[last.length - 1].duration = total - last[last.length - 1].startAt;

  return result;
}

export function toTranscriptClips(data: Map<string, Transcript[]>) {
  const result: TranscriptClip[] = [];

  for (const [key, value] of data.entries()) {
    for (let v of value) {
      result.push({
        group: key,
        ...v,
      });
    }
  }

  return result;
}
