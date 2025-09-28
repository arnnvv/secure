import { LogOut, Upload } from "lucide-react";
import { getCurrentSession, signOutAction, uploadFile } from "@/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileInput } from "./FileInput";
import { SignOutFormComponent } from "./SignOutForm";
import { UploadFormComponent } from "./UploadFormComponent";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export async function UserProfileDropdown() {
  const { user } = await getCurrentSession();
  if (!user) return null;

  const text: string = !user.picture ? "Upload Image" : "Change Image";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage
            src={user.picture || "/default-avatar.png"}
            alt={`${user.username || "User"}'s avatar`}
          />
          <AvatarFallback>
            {user.username ? user.username.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <UploadFormComponent action={uploadFile}>
            <label
              htmlFor="upload-button"
              className="w-full block cursor-pointer hover:bg-secondary p-2 rounded-md transition-colors"
            >
              <div className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                <span>{text}</span>
              </div>
              <FileInput />
            </label>
          </UploadFormComponent>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <SignOutFormComponent action={signOutAction}>
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </Button>
          </SignOutFormComponent>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Mobile-specific dropdown component
export function MobileUserProfileDropdown({ user, onClose }: { user?: { username: string | null; picture?: string | null } | null; onClose: () => void }) {
  const text: string = !user?.picture ? "Upload Image" : "Change Image";

  return (
    <div className="py-2">
      <div className="px-4 py-2 border-b border-[#2A2A3E]">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.picture || ""} />
            <AvatarFallback className="avatar-purple">
              {user?.username?.[0]?.toUpperCase() || "S"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-medium">{user?.username || "User"}</p>
            <p className="text-gray-400 text-sm">Profile Settings</p>
          </div>
        </div>
      </div>
      
      <div className="py-1">
        <UploadFormComponent action={uploadFile}>
          <label
            htmlFor="upload-button"
            className="w-full block cursor-pointer hover:bg-[#2A2A3E] px-4 py-3 text-white transition-colors"
            onClick={onClose}
          >
            <div className="flex items-center">
              <Upload className="mr-3 h-4 w-4" />
              <span>{text}</span>
            </div>
            <FileInput />
          </label>
        </UploadFormComponent>
        
        <SignOutFormComponent action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center px-4 py-3 text-white hover:bg-[#2A2A3E] transition-colors"
            onClick={onClose}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span>Log out</span>
          </button>
        </SignOutFormComponent>
      </div>
    </div>
  );
}

export function UserProfileDropdownSkeleton() {
  return <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />;
}

// Mobile-specific skeleton with dark theme
export function MobileUserProfileDropdownSkeleton() {
  return (
    <div className="py-2">
      <div className="px-4 py-2 border-b border-[#2A2A3E]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#2A2A3E] animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-[#2A2A3E] rounded animate-pulse"></div>
            <div className="h-3 w-24 bg-[#2A2A3E] rounded animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="py-1">
        <div className="px-4 py-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#2A2A3E] rounded mr-3 animate-pulse"></div>
            <div className="h-4 w-24 bg-[#2A2A3E] rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="px-4 py-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#2A2A3E] rounded mr-3 animate-pulse"></div>
            <div className="h-4 w-16 bg-[#2A2A3E] rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
