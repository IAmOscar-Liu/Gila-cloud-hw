import { useShallow } from "zustand/shallow";
import { useTranscriptStore } from "../store/transcriptStore";
import { cn } from "../utils/cn";
import { formatSecondsToTime } from "../utils/formatSecondsToTime";
import Error from "./Error";
import Loading from "./Loading";
import NoData from "./NoData";
import { useEventStore } from "../store/eventStore";
import { userInfo } from "os";
import { useRef } from "react";

function EditingArea() {
  const {
    files,
    fileAt,
    highlightTranscriptClip,
    transcriptClipAt,
    transcriptClips,
  } = useTranscriptStore(
    useShallow((state) => ({
      files: state.files,
      fileAt: state.fileAt,
      transcriptClipAt: state.transcriptClipAt,
      transcriptClips: state.transcriptClips,
      highlightTranscriptClip: state.highlightTranscriptClip,
    })),
  );
  const publish = useEventStore((state) => state.publish);

  const transcriptFile =
    fileAt !== undefined && files[fileAt] !== undefined
      ? files[fileAt]
      : undefined;
  const currentClip =
    transcriptClipAt !== undefined
      ? transcriptClips[transcriptClipAt]
      : undefined;
  const currentClipStartAt =
    transcriptFile?.transcriptData !== undefined && currentClip !== undefined
      ? transcriptFile.transcriptData
          .get(currentClip.group)
          ?.find((d) => d.startAt === currentClip.startAt)?.startAt
      : undefined;

  const activeClipRef = useRef<HTMLLIElement>(null);

  return (
    <div className="bg-secondary-light">
      <div className="mx-auto flex h-screen w-[90%] max-w-[600px] flex-col py-4">
        <h1 className="text-2xl font-semibold tracking-tight">Transcript</h1>
        <div className="mt-2 h-0 flex-grow space-y-3 overflow-y-auto">
          {transcriptFile === undefined ? (
            <NoData className="h-full" />
          ) : transcriptFile.isLoading ? (
            <Loading className="h-full" />
          ) : transcriptFile.error ? (
            <Error className="h-full" />
          ) : transcriptFile.transcriptData === undefined ? (
            <NoData className="h-full" />
          ) : (
            <>
              {Array.from(transcriptFile.transcriptData.entries()).map(
                ([key, value]) => (
                  <div key={key}>
                    <h2 className="text-xl font-semibold tracking-tight">
                      {key}
                    </h2>
                    <ul className="mt-2 space-y-2">
                      {value.map((clip, clipIdx) => (
                        <li
                          key={clip.startAt}
                          ref={(ref) => {
                            if (clip.startAt === currentClipStartAt)
                              ref?.scrollIntoView({
                                behavior: "smooth",
                              });
                          }}
                          className={cn(
                            "group flex cursor-pointer items-center rounded-md bg-white py-2 shadow-sm",
                            {
                              "highlight bg-primary text-white":
                                clip.highlighted,
                              "active border-[2px] border-highlight text-highlight-text":
                                clip.startAt === currentClipStartAt,
                            },
                          )}
                        >
                          <p
                            className="px-2 font-semibold text-primary group-[.active.highlight]:text-highlight-text group-[.active]:text-highlight-text group-[.highlight]:text-white"
                            onClick={() =>
                              publish("videoCurrentTime", clip.startAt)
                            }
                          >
                            {formatSecondsToTime(clip.startAt)}
                          </p>
                          <p
                            className="flex-grow"
                            onClick={() =>
                              highlightTranscriptClip(fileAt!, key, clipIdx)
                            }
                          >
                            {clip.content}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditingArea;
