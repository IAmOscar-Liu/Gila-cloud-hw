import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { TranscriptAction, TranscriptState } from "../types/Transcript";
import { findCurrentChipsAt } from "../utils/findCurrentChipAt";
import {
  processTranscript,
  toTranscriptClips,
} from "../utils/processTranscript";
import { waitFor } from "../utils/waitFor";

export const useTranscriptStore = create<TranscriptState & TranscriptAction>()(
  devtools((set, get) => ({
    currentTime: 0,
    transcriptClips: [],
    transcriptClipAt: undefined,
    fileAt: undefined,
    files: [],
    onFileChange: (files) => {
      // console.log(files);
      const oldFiles = get().files;
      const oldfileAt = get().fileAt;
      const addedFiles = files
        .filter(
          (file) =>
            !oldFiles.find((oldFile) => oldFile.file.name === file.name),
        )
        .map((addedFile) => ({
          file: addedFile,
          transcriptData: undefined,
          fileDuration: undefined,
          isLoading: false,
          error: null,
        }));
      // console.log(addedFiles);
      const newFiles = [...oldFiles, ...addedFiles];
      set({
        files: newFiles,
        fileAt: oldFiles.length === 0 && newFiles.length > 0 ? 0 : oldfileAt,
        transcriptClips:
          oldFiles.length === 0 && newFiles.length > 0
            ? []
            : get().transcriptClips,
        transcriptClipAt:
          oldFiles.length === 0 && newFiles.length > 0
            ? undefined
            : get().transcriptClipAt,
      });
    },
    removeFile: (removeAt) => {
      const oldFiles = get().files;
      const oldfileAt = get().fileAt;
      const newFileAt =
        oldfileAt === undefined || oldfileAt === removeAt
          ? undefined
          : oldfileAt > removeAt
            ? oldfileAt - 1
            : oldfileAt;
      const newCurrentTime =
        oldfileAt === undefined || oldfileAt === removeAt
          ? 0
          : get().currentTime;
      set({
        currentTime: newCurrentTime,
        files: oldFiles.filter((_, idx) => idx !== removeAt),
        fileAt: newFileAt,
      });
    },
    clearFiles: () => set({ files: [], fileAt: undefined }),
    setCurrentFile: (targetAt) => {
      const oldFiles = get().files;
      if (targetAt === undefined || targetAt < 0 || targetAt > oldFiles.length)
        return;
      set({ fileAt: targetAt });
    },
    setCurrentTime: (time) => {
      // set({ currentTime: time });

      const oldTime = get().currentTime;
      const oldChipAt = get().transcriptClipAt;
      const oldClips = get().transcriptClips;
      if (oldChipAt === undefined || oldClips.length === 0)
        return set({ currentTime: time });

      let newChipAt = oldChipAt;

      //   oldClips[newChipAt] !== undefined &&
      //     oldClips[newChipAt].startAt <= time &&
      //     time < oldClips[newChipAt].startAt + oldClips[newChipAt].duration;

      if (oldTime <= time && time < oldTime + 1) {
        while (
          oldClips[newChipAt].startAt > time ||
          time >= oldClips[newChipAt].startAt + oldClips[newChipAt].duration
        ) {
          newChipAt++;
          // if (oldClips[newChipAt] === undefined) break;
        }
        newChipAt =
          oldClips[newChipAt] !== undefined ? newChipAt : oldClips.length - 1;
      } else {
        newChipAt = findCurrentChipsAt(oldClips, time);
      }
      // console.log("transcriptClipAt: " + newChipAt);
      set({ currentTime: time, transcriptClipAt: newChipAt });
    },
    fetchVideoInfo: async (index, info) => {
      const oldFiles = get().files;
      if (
        oldFiles[index].fileDuration !== undefined &&
        oldFiles[index].transcriptData !== undefined
      )
        return set({
          currentTime: 0,
          transcriptClips: toTranscriptClips(oldFiles[index].transcriptData),
          transcriptClipAt: 0,
        });
      try {
        set({
          currentTime: 0,
          transcriptClips: [],
          transcriptClipAt: undefined,
          files: oldFiles.map((oldFile, io) =>
            io !== index
              ? oldFile
              : {
                  ...oldFile,
                  transcriptData: undefined,
                  fileDuration: info.fileDuration,
                  isLoading: true,
                  error: null,
                },
          ),
        });
        const res = await fetch("/transcript.json");
        await waitFor(600);
        const json = await res.json();
        const tData = processTranscript(json, info.fileDuration ?? 60);
        const tClips = toTranscriptClips(tData);
        console.log("tClips: ", tClips);
        set({
          currentTime: 0,
          transcriptClips: tClips,
          transcriptClipAt: 0,
          files: oldFiles.map((oldFile, io) =>
            io !== index
              ? oldFile
              : {
                  ...oldFile,
                  transcriptData: tData,
                  fileDuration: info.fileDuration,
                  isLoading: false,
                  error: null,
                },
          ),
        });
      } catch (error) {
        set({
          currentTime: 0,
          transcriptClips: [],
          transcriptClipAt: undefined,
          files: oldFiles.map((oldFile, io) =>
            io !== index
              ? oldFile
              : {
                  ...oldFile,
                  transcriptData: undefined,
                  fileDuration: info.fileDuration,
                  isLoading: false,
                  error: error,
                },
          ),
        });
      }
    },
    highlightTranscriptClip: (fIdx, group, clipIdx) => {
      const oldFiles = get().files;
      if (oldFiles[fIdx].transcriptData === undefined) return;
      const newTranscriptData = oldFiles[fIdx].transcriptData;

      if (newTranscriptData.get(group) === undefined) return;
      newTranscriptData.set(
        group,
        newTranscriptData
          .get(group)!
          .map((clip, cI) =>
            cI !== clipIdx ? clip : { ...clip, highlighted: !clip.highlighted },
          ),
      );

      const newTranscriptClips = toTranscriptClips(newTranscriptData);

      set({
        transcriptClips: newTranscriptClips,
        files: oldFiles.map((oldFile, fI) =>
          fI !== fIdx
            ? oldFile
            : {
                ...oldFile,
                transcriptData: newTranscriptData,
              },
        ),
      });
    },
  })),
);
