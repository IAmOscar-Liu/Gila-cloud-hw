import {
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useTranscriptStore } from "../store/transcriptStore";
import { cn } from "../utils/cn";
import { formatSecondsToTime } from "../utils/formatSecondsToTime";
import VideoContainer, { VideoContainerHandle } from "./VideoContainer";
import { useEventStore } from "../store/eventStore";

function VideoPlayer({ className = "" }: { className?: string }) {
  const {
    files,
    fileAt,
    setCurrentFile,
    setCurrentTime,
    fetchVideoInfo,
    transcriptClipAt,
    transcriptClips,
  } = useTranscriptStore(
    useShallow((state) => ({
      transcriptClipAt: state.transcriptClipAt,
      transcriptClips: state.transcriptClips,
      files: state.files,
      fileAt: state.fileAt,
      setCurrentFile: state.setCurrentFile,
      setCurrentTime: state.setCurrentTime,
      fetchVideoInfo: state.fetchVideoInfo,
    })),
  );
  const videoContainerRef = useRef<VideoContainerHandle>(null);
  const [videoStatus, setVideoStatus] = useState<
    "Playing" | "Paused" | "Ended"
  >("Paused");
  const fileDuration =
    fileAt === undefined ? undefined : files[fileAt].fileDuration;

  const { subscribe, unsubscribe } = useEventStore(
    useShallow((state) => ({
      subscribe: state.subscribe,
      unsubscribe: state.unsubscribe,
    })),
  );

  useEffect(() => {
    const handleEvent = (data: any) => {
      videoContainerRef.current?.goTo(data);
    };
    subscribe("videoCurrentTime", handleEvent);
    return () => {
      unsubscribe("videoCurrentTime", handleEvent);
    };
  }, [subscribe, unsubscribe]);

  return (
    <div className={cn("", className)}>
      <VideoContainer
        ref={videoContainerRef}
        key={fileAt === undefined ? undefined : files[fileAt].file.name}
        file={fileAt === undefined ? undefined : files[fileAt].file}
        transcriptClipAt={transcriptClipAt}
        transcriptClips={transcriptClips}
        setVideoStatus={setVideoStatus}
        setCurrentTime={setCurrentTime}
        fetchVideoTranscript={(duration) => {
          console.log("video duration: " + duration);
          fetchVideoInfo(fileAt!, { fileDuration: duration });
        }}
      />
      <div className="mb-3 mt-3 flex justify-between">
        <SkipBackIcon
          className={
            fileAt === undefined || fileAt === 0
              ? "text-gray-500"
              : "cursor-pointer"
          }
          onClick={() =>
            fileAt !== undefined && fileAt > 0 && setCurrentFile(fileAt - 1)
          }
        />
        {videoStatus === "Playing" ? (
          <PauseIcon
            className="cursor-pointer"
            onClick={() => videoContainerRef.current?.pause()}
          />
        ) : (
          <PlayIcon
            className="cursor-pointer"
            onClick={() => videoContainerRef.current?.play()}
          />
        )}

        <SkipForwardIcon
          className={
            fileAt === undefined || fileAt === files.length - 1
              ? "text-gray-500"
              : "cursor-pointer"
          }
          onClick={() =>
            fileAt !== undefined &&
            fileAt < files.length - 1 &&
            setCurrentFile(fileAt + 1)
          }
        />
        <p>
          <VideoCurrentTimeText />
          {" / "}
          {formatSecondsToTime(
            fileAt === undefined ? undefined : files[fileAt].fileDuration,
          )}
        </p>
      </div>
      <VideoHighlightSegment duration={fileDuration} />
    </div>
  );
}

function VideoCurrentTimeText() {
  const { currentTime } = useTranscriptStore(
    useShallow((state) => ({
      currentTime: state.currentTime,
    })),
  );
  return <>{formatSecondsToTime(currentTime)}</>;
}

function VideoHighlightSegment({ duration }: { duration: number | undefined }) {
  const { currentTime, transcriptClips } = useTranscriptStore(
    useShallow((state) => ({
      currentTime: state.currentTime,
      transcriptClips: state.transcriptClips,
    })),
  );

  const mergedClips = useMemo(() => {
    const result: { duration: number; startAt: number }[] = [];
    for (let clip of transcriptClips) {
      if (!clip.highlighted) continue;
      if (result.length === 0) {
        result.push({ duration: clip.duration, startAt: clip.startAt });
      } else if (
        clip.startAt ===
        result[result.length - 1].startAt + result[result.length - 1].duration
      ) {
        result[result.length - 1].duration += clip.duration;
      } else {
        result.push({ duration: clip.duration, startAt: clip.startAt });
      }
    }
    return result;
  }, [transcriptClips]);

  return (
    <div className="bg-secondary-progressbar relative h-6 overflow-hidden rounded-md">
      {duration !== undefined &&
        mergedClips.map((clip) => (
          <div
            key={clip.startAt}
            className="absolute top-0 h-full rounded-md bg-primary"
            style={{
              width: (clip.duration / duration) * 100 + "%",
              left: (clip.startAt / duration) * 100 + "%",
            }}
          ></div>
        ))}
      {duration !== undefined && (
        <div
          className="absolute top-0 h-full bg-danger"
          style={{
            width: 4,
            left: `calc(${(currentTime / duration) * 100}% - 2px)`,
          }}
        ></div>
      )}
    </div>
  );
}

export default VideoPlayer;
