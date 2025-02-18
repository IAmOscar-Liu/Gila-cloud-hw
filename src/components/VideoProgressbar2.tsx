import { useMemo, useRef } from "react";
import { useShallow } from "zustand/shallow";
import { useEventStore } from "../store/eventStore";
import { useTranscriptStore } from "../store/transcriptStore";

function VideoProgressbar2({ duration }: { duration: number | undefined }) {
  const { transcriptClips, currentTime, draggingTime, setDraggingTime } =
    useTranscriptStore(
      useShallow((state) => ({
        currentTime: state.currentTime,
        draggingTime: state.draggingTime,
        setDraggingTime: state.setDraggingTime,
        transcriptClips: state.transcriptClips,
      })),
    );
  const publish = useEventStore((state) => state.publish);

  // const currentTime = 0;
  // const [draggingTime, setDraggingTime] = useState<number | undefined>(
  //   undefined,
  // ); // Range value
  const trackRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController>();

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

  const calculateCurrentTime = (e: MouseEvent) => {
    if (!trackRef.current || duration === undefined) return;

    const track = trackRef.current;
    const rect = track.getBoundingClientRect();
    const offsetX = e.clientX - rect.left; // Distance from the left of the track
    return Math.min(
      duration,
      Math.max(0, (offsetX / rect.width) * duration), // Constrain between 0 and 100
    );
  };

  const handleMouseMove = (e: MouseEvent) => {
    // console.log("handleMouseMove");
    setDraggingTime(calculateCurrentTime(e));
  };

  const handleMouseDown = (e: MouseEvent) => {
    // console.log("handleMouseDown");
    abortControllerRef.current = new AbortController();
    document.addEventListener("mousemove", handleMouseMove, {
      signal: abortControllerRef.current.signal,
    });
    document.addEventListener("mouseup", handleMouseUp, {
      signal: abortControllerRef.current.signal,
    });
    setDraggingTime(calculateCurrentTime(e));
  };

  const handleMouseUp = (e: MouseEvent) => {
    const result = calculateCurrentTime(e);
    console.log("handleMouseUp at " + result);
    if (result !== undefined) publish("videoCurrentTime", result);
    setDraggingTime(undefined);
    // publish("videoCurrentTime", draggingTime);
    // setDraggingTime(undefined);
    // document.removeEventListener("mousemove", handleMouseMove);
    // document.removeEventListener("mouseup", handleMouseUp);
    abortControllerRef.current?.abort();
  };

  return (
    <div
      className="relative h-6 cursor-pointer rounded-md bg-secondary-progressbar"
      ref={trackRef}
      // @ts-expect-error
      onMouseDown={handleMouseDown}
    >
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
          className="absolute -bottom-0.5 -top-0.5 rounded-md bg-danger"
          style={{
            width: 12,
            left: `calc(${((draggingTime ?? currentTime) / duration) * 100}% - 6px)`,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            // @ts-expect-error
            handleMouseDown(e);
          }}
        ></div>
      )}
    </div>
  );
}

export default VideoProgressbar2;
