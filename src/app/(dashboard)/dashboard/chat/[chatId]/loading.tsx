import type { JSX } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Load(): JSX.Element {
  return (
    <div className="flex flex-col h-full items-center bg-[#1A1A2E]">
      <div className="w-full bg-[#20203A] px-4 py-3 border-b border-[#2A2A3E]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton circle height={40} width={40} />
            <Skeleton height={16} width={100} />
          </div>
          <Skeleton height={32} width={60} />
        </div>
      </div>
      <div className="flex-1 max-h-full overflow-y-scroll w-full">
        <div className="flex flex-col flex-auto h-full p-6">
          <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-[#20203A] h-full p-4">
            <div className="flex flex-col h-full overflow-x-auto mb-4">
              <div className="flex flex-col h-full">
                <div className="grid grid-cols-12 gap-y-2">
                  <div className="col-start-6 col-end-13 p-3 rounded-lg">
                    <div className="flex items-center justify-start flex-row-reverse">
                      <div className="relative h-10 w-10">
                        <Skeleton width={40} height={40} borderRadius={999} />
                      </div>
                      <div className="relative mr-3 text-sm bg-[#2A2A3E] py-2 px-4 border border-[#2A2A3E] rounded-xl">
                        <Skeleton className="ml-2" width={150} height={20} />
                      </div>
                    </div>
                  </div>
                  <div className="col-start-6 col-end-13 p-3 rounded-lg">
                    <div className="flex items-center justify-start flex-row-reverse">
                      <div className="relative h-10 w-10">
                        <Skeleton width={40} height={40} borderRadius={999} />
                      </div>
                      <div className="relative mr-3 text-sm bg-[#2A2A3E] py-2 px-4 border border-[#2A2A3E] rounded-xl">
                        <Skeleton className="ml-2" width={150} height={20} />
                      </div>
                    </div>
                  </div>
                  <div className="col-start-1 col-end-8 p-3 rounded-lg">
                    <div className="flex flex-row items-center">
                      <div className="relative h-10 w-10">
                        <Skeleton width={40} height={40} borderRadius={999} />
                      </div>
                      <div className="relative ml-3 text-sm bg-[#1A1A2E] py-2 px-4 border border-[#2A2A3E] rounded-xl">
                        <Skeleton className="ml-2" width={150} height={20} />
                      </div>
                    </div>
                  </div>
                  <div className="col-start-6 col-end-13 p-3 rounded-lg">
                    <div className="flex items-center justify-start flex-row-reverse">
                      <div className="relative h-10 w-10">
                        <Skeleton width={40} height={40} borderRadius={999} />
                      </div>
                      <div className="relative mr-3 text-sm bg-[#2A2A3E] py-2 px-4 border border-[#2A2A3E] rounded-xl">
                        <Skeleton className="ml-2" width={150} height={20} />
                      </div>
                    </div>
                  </div>
                  <div className="col-start-1 col-end-8 p-3 rounded-lg">
                    <div className="flex flex-row items-center">
                      <div className="relative h-10 w-10">
                        <Skeleton width={40} height={40} borderRadius={999} />
                      </div>
                      <div className="relative ml-3 text-sm bg-[#1A1A2E] py-2 px-4 border border-[#2A2A3E] rounded-xl">
                        <Skeleton className="ml-2" width={150} height={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
