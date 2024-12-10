import { ClapperboardIcon, Plus, X } from "lucide-react";
import { useShallow } from "zustand/shallow";
import { useTranscriptStore } from "../store/transcriptStore";
import { cn } from "../utils/cn";
import VideoPlayer from "./VideoPlayer";

function PreviewArea() {
  const { files, fileAt, onFileChange, removeFile, setCurrentFile } =
    useTranscriptStore(
      useShallow((state) => ({
        files: state.files,
        fileAt: state.fileAt,
        onFileChange: state.onFileChange,
        removeFile: state.removeFile,
        setCurrentFile: state.setCurrentFile,
      })),
    );

  return (
    <div className="bg-secondary-dark">
      <div className="mx-auto flex h-screen w-[90%] max-w-[600px] flex-col py-4 text-white">
        <h1 className="text-2xl font-semibold tracking-tight">Preview</h1>
        <div className="mt-2 h-0 flex-grow overflow-y-auto">
          <VideoPlayer className="mt-4" />
          <div className="mt-6 flex flex-wrap items-start gap-3 pe-2">
            <label className="bg-secondary-progressbar flex h-[90px] w-[150px] cursor-pointer flex-col items-center justify-center rounded-md px-2 py-2 shadow-md">
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) =>
                  onFileChange(e.target.files ? [...e.target.files] : [])
                }
              />
              <Plus className="m-auto size-6" />
              <p className="text-center">Add video</p>
            </label>
            {files.map((file, fIdx) => (
              <div
                key={file.file.name}
                onClick={() => fIdx !== fileAt && setCurrentFile(fIdx)}
                className={cn(
                  "bg-secondary-progressbar relative flex h-[90px] w-[150px] cursor-pointer flex-col items-center justify-center rounded-md px-2 py-1 shadow-md",
                  {
                    "cursor-default bg-primary": fIdx === fileAt,
                  },
                )}
              >
                <ClapperboardIcon className="m-auto size-6" />
                <p className="line-clamp-2 w-full break-words text-center text-sm">
                  {file.file.name}
                </p>
                <div
                  className="absolute -right-1.5 -top-1.5 cursor-pointer rounded-full bg-slate-300 p-1"
                  onClick={() => removeFile(fIdx)}
                >
                  <X className="size-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewArea;
