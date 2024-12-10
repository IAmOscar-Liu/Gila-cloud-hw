import { BracesIcon } from "lucide-react";
import { cn } from "../utils/cn";

function NoData({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <BracesIcon className="size-12" />
      <p className="mt-2 text-2xl">Please select a video</p>
    </div>
  );
}

export default NoData;
