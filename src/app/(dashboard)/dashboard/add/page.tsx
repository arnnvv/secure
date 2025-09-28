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
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Add Friend</h2>
              <p className="text-gray-300">Enter a username to send a friend request</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="friend-username"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Username
                </Label>
                <Input
                  type="text"
                  name="friend-username"
                  id="friend-username"
                  className="w-full px-4 py-3 bg-[#20203A] border border-[#2A2A3E] rounded-lg text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter username..."
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Send Request</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FormComponent>
  );
}
