import loadingIcon from "../assets/loading.svg";
import { cn } from "../utils/cn";

function Loading({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <img src={loadingIcon} width={50} height={50} />
      <p className="mt-2 text-2xl">Loading...</p>
    </div>
  );
}

export default Loading;
