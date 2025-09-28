import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { JSX } from "react";
import { addFriendAction, getCurrentSession } from "@/actions";
import { FormComponent } from "@/components/FormComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Add friend",
  description: "Add a friend to your account by their username",
};

export default async function Page(): Promise<JSX.Element> {
  const { user } = await getCurrentSession();
  if (!user) return redirect("/login");

  return (
    <FormComponent action={addFriendAction}>
      <div className="h-full flex flex-col bg-[#1A1A2E]">
        {/* Mobile Header */}
        <div className="lg:hidden bg-[#20203A] px-4 py-4 border-b border-[#2A2A3E]">
          <h1 className="text-white font-bold text-xl">Add Friend</h1>
        </div>
        
        {/* Desktop Header */}
        <div className="hidden lg:block pt-8">
          <h1 className="text-5xl font-bold mb-8 text-white">Add a friend</h1>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 lg:py-0">
          {/* Mobile Icon */}
          <div className="lg:hidden">
            <div className="mobile-add-friend-icon">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          
          <div className="w-full max-w-md">
            <h2 className="mobile-add-friend-title">Add Friend</h2>
            <p className="mobile-add-friend-subtitle">Enter a username to send a friend request.</p>
            
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="friend-username"
                  className="block text-sm font-medium leading-6 text-white lg:text-gray-900 mb-2"
                >
                  Friend&apos;s Username
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <Input
                    type="text"
                    name="friend-username"
                    id="friend-username"
                    className="mobile-search-input"
                    placeholder="Enter username..."
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="mobile-send-btn"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Send Friend Request</span>
              </Button>
            </div>
            
            {/* Tips Section */}
            <div className="mt-8 mobile-tips-box">
              <h3 className="mobile-tips-title">Tips:</h3>
              <ul className="mobile-tips-list">
                <li className="mobile-tips-item">
                  <span className="mobile-tips-bullet">•</span>
                  Make sure the username is spelled correctly
                </li>
                <li className="mobile-tips-item">
                  <span className="mobile-tips-bullet">•</span>
                  Usernames are case-sensitive
                </li>
                <li className="mobile-tips-item">
                  <span className="mobile-tips-bullet">•</span>
                  You can only send one request per user
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </FormComponent>
  );
}
