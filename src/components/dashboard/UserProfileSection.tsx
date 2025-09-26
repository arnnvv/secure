import Skeleton from "react-loading-skeleton";
import { getCurrentSession } from "@/actions";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export async function UserProfileSection() {
  const { user } = await getCurrentSession();
  if (!user) return null;

  return (
    <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
      <div className="relative h-8 w-8 bg-gray-50">
        <Avatar>
          <AvatarImage src={user.picture || ""} alt="User profile picture" />
          <AvatarFallback>
            {user.username ? user.username[0].toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      </div>
      <span className="sr-only">Your profile</span>
      <div className="flex flex-col">
        <span aria-hidden="true">{user.username}</span>
      </div>
    </div>
  );
}

export function UserProfileSkeleton() {
  return (
    <div className="flex flex-1 items-center gap-x-4 px-6 py-3">
      <Skeleton circle height={32} width={32} />
      <div className="flex flex-col gap-1">
        <Skeleton height={16} width={100} />
      </div>
    </div>
  );
}
