import { CircleAlertIcon } from "lucide-react";
import { cn } from "../utils/cn";

function Error({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <CircleAlertIcon className="size-12" />
      <p className="mt-2 text-2xl text-danger">Please select a video</p>
    </div>
  );
}

export default Error;
