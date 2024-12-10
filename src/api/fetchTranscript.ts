import { TranscriptFile } from "../types/Transcript";
import { processTranscript } from "../utils/processTranscript";
import { waitFor } from "../utils/waitFor";

async function fetchTranscript(info: Partial<Omit<TranscriptFile, "file">>) {
  const res = await fetch("/transcript.json");
  await waitFor(600);
  const json = await res.json();
  return processTranscript(json, info.fileDuration ?? 60);
}

export default fetchTranscript;
