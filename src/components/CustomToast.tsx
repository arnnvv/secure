import type { JSX } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ToastContent = ({
  senderName,
  senderMessage,
  image,
}: {
  senderName: string;
  senderMessage: string;
  image: string | null;
}): JSX.Element => (
  <div className="flex items-center space-x-3">
    <div className="flex-shrink-0">
      <Avatar className="h-10 w-10">
        <AvatarImage src={image || ""} alt={`Avatar of ${senderName}`} />
        <AvatarFallback>{senderName.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
    </div>
    <div className="flex-grow min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{senderName}</p>
      <p className="text-sm text-gray-500 truncate">{senderMessage}</p>
    </div>
  </div>
);

export const CustomToast = ({
  toastId,
  href,
  senderName,
  senderMessage,
  image,
}: {
  toastId: string | number;
  href: string;
  senderName: string;
  senderMessage: string;
  image: string | null;
}): JSX.Element => (
  <div className="max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex items-center ring-1 ring-black ring-opacity-5 z-50">
    <a
      onClick={(): string | number => toast.dismiss(toastId)}
      href={href}
      className="flex-grow p-4"
    >
      <ToastContent
        senderName={senderName}
        senderMessage={senderMessage}
        image={image}
      />
    </a>
    <div className="flex-shrink-0 border-l border-gray-200">
      <button
        type="button"
        onMouseDown={(): string | number => toast.dismiss(toastId)}
        className="h-full px-4 py-2 text-sm font-medium text-cyan-400 hover:text-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        Close
      </button>
    </div>
  </div>
);
