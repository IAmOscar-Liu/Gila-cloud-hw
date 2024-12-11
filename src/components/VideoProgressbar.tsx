import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useTranscriptStore } from "../store/transcriptStore";

function VideoProgressbar({ duration }: { duration: number | undefined }) {
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
    <div className="relative mx-1 h-6 rounded-md bg-secondary-progressbar">
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
          className="absolute top-0 h-full rounded-sm bg-danger"
          style={{
            width: 12,
            left: `calc(${(currentTime / duration) * 100}% - 6px)`,
          }}
        ></div>
      )}
    </div>
  );
}

export default VideoProgressbar;
