export type Transcript = {
  startAt: number;
  duration: number;
  content: string;
  highlighted: boolean;
};

export type TranscriptClip = Transcript & {
  group: string;
};

export type TranscriptFile = {
  file: File;
  transcriptData: Map<string, Transcript[]> | undefined;
  fileDuration: number | undefined;
  isLoading: boolean;
  error: any;
};

export type TranscriptState = {
  currentTime: number;
  draggingTime: number | undefined;
  transcriptClips: TranscriptClip[];
  transcriptClipAt: number | undefined;
  fileAt: number | undefined;
  files: TranscriptFile[];
};

export type TranscriptAction = {
  onFileChange: (files: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  setCurrentFile: (index: number | undefined) => void;
  setDraggingTime: (time: number | undefined) => void;
  setCurrentTime: (time: number) => void;
  fetchVideoInfo: (
    index: number,
    data: Partial<Omit<TranscriptFile, "file">>,
  ) => void;
  highlightTranscriptClip: (
    fIdx: number,
    group: string,
    clipIdx: number,
  ) => void;
};
