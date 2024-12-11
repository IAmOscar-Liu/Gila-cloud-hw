import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  Dispatch,
  SetStateAction,
  Ref,
} from "react";
import { TranscriptClip } from "../types/Transcript";
import { cn } from "../utils/cn";

export type VideoContainerHandle = {
  play: () => void;
  pause: () => void;
  goTo: (time: number) => void;
};

function VideoContainer(
  {
    file,
    transcriptClipAt,
    transcriptClips,
    setVideoStatus,
    setCurrentTime,
    fetchVideoTranscript,
  }: {
    file?: File;
    transcriptClipAt: number | undefined;
    transcriptClips: TranscriptClip[];
    setVideoStatus: Dispatch<SetStateAction<"Playing" | "Paused" | "Ended">>;
    setCurrentTime: (time: number) => void;
    fetchVideoTranscript: (duration: number) => void;
  },
  ref: Ref<VideoContainerHandle>,
) {
  const [videoURL, setVideoURL] = useState<string | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // console.log("trigger useeffect");
    // console.log("filetype: ", file?.type);
    // console.log("filename: ", file?.name);
    if (file && file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setVideoURL(url);
    }

    return () => {
      if (videoURL) URL.revokeObjectURL(videoURL);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    goTo: (time) => {
      if (videoRef.current) {
        setCurrentTime(time);
        videoRef.current.currentTime = time;
      }
    },
  }));

  const currentTranscript =
    transcriptClipAt === undefined
      ? undefined
      : transcriptClips[transcriptClipAt];

  return (
    <div className="relative aspect-video overflow-hidden rounded-md bg-black">
      {file && videoURL ? (
        <>
          <video
            autoPlay
            ref={videoRef}
            width={"100%"}
            height={"100%"}
            // controls={false}
            onTimeUpdate={(e) => {
              // console.log(
              //   `current time:  ${e.currentTarget.currentTime}/${e.currentTarget.duration}`,
              // );
              setCurrentTime(e.currentTarget.currentTime);
            }}
            onPlay={() => setVideoStatus("Playing")}
            onPause={() => setVideoStatus("Paused")}
            onEnded={() => setVideoStatus("Ended")}
            onLoadedMetadata={(e) =>
              fetchVideoTranscript(e.currentTarget.duration)
            }
          >
            <source src={videoURL} type={file.type} />
            Your browser does not support HTML5 video.
          </video>
          {currentTranscript && (
            <div
              className={cn(
                "absolute bottom-4 left-[5%] flex w-[90%] text-lg",
                {
                  "highlight group text-primary drop-shadow-sm":
                    currentTranscript.highlighted,
                },
              )}
            >
              <p className="bg-[rgba(0,0,0,.5)] px-2 group-[.highlight]:bg-[rgba(0,0,0,.2)]">
                {currentTranscript.content}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full">
          <p className="m-auto w-[max-content] text-xl">
            Please select a video
          </p>
        </div>
      )}
    </div>
  );
}

export default forwardRef(VideoContainer);
