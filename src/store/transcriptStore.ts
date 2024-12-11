import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as api from "../api";
import { TranscriptAction, TranscriptState } from "../types/Transcript";
import { findCurrentChipsAt } from "../utils/findCurrentChipAt";
import { toTranscriptClips } from "../utils/processTranscript";

export const useTranscriptStore = create<TranscriptState & TranscriptAction>()(
  devtools((set, get) => ({
    currentTime: 0,
    draggingTime: undefined,
    transcriptClips: [],
    transcriptClipAt: undefined,
    fileAt: undefined,
    files: [],
    onFileChange: (files) => {
      console.log(files);
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
      if (removeAt < 0 || removeAt >= oldFiles.length) return;

      const oldfileAt = get().fileAt;
      if (oldfileAt === undefined || oldfileAt === removeAt) {
        return set({
          currentTime: 0,
          transcriptClips: [],
          transcriptClipAt: undefined,
          files: oldFiles.filter((_, idx) => idx !== removeAt),
          fileAt: undefined,
        });
      }
      // console.log("removeAt: " + removeAt);
      // console.log("oldFileAt: " + oldfileAt);
      // console.log(
      //   "new FileAt: " + (oldfileAt > removeAt ? oldfileAt - 1 : oldfileAt),
      // );

      set({
        files: oldFiles.filter((_, idx) => idx !== removeAt),
        fileAt: oldfileAt > removeAt ? oldfileAt - 1 : oldfileAt,
      });
    },
    clearFiles: () =>
      set({
        currentTime: 0,
        transcriptClips: [],
        transcriptClipAt: undefined,
        fileAt: undefined,
        files: [],
      }),
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
        // current time is less than 1 second ahead of previous time, search the next
        while (
          oldClips[newChipAt].startAt > time ||
          time >= oldClips[newChipAt].startAt + oldClips[newChipAt].duration
        ) {
          newChipAt++;
        }
        newChipAt =
          oldClips[newChipAt] !== undefined ? newChipAt : oldClips.length - 1;
      } else {
        // otherwise, use binary search to find the corresponding clip
        newChipAt = findCurrentChipsAt(oldClips, time);
      }
      // console.log("transcriptClipAt: " + newChipAt);
      set({ currentTime: time, transcriptClipAt: newChipAt });
    },
    setDraggingTime: (time) => set({ draggingTime: time }),
    fetchVideoInfo: (index, info) => {
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

      api
        .fetchTranscript(info)
        .then((tData) => {
          const tClips = toTranscriptClips(tData);
          console.log("tClips: ", tClips);
          set({
            // currentTime: 0,
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
        })
        .catch((error) => {
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
        });
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
