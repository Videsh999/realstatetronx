"use client";

import { UserButton, useUser } from "@clerk/nextjs";

export default function ClerkUserBlock() {
  const { user } = useUser();
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl">
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            userButtonAvatarBox:
              "w-10 h-10 rounded-full border-2 border-white/10",
          },
        }}
      />
      <div className="overflow-hidden">
        <p className="text-sm font-bold truncate">
          {user?.fullName ||
            user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
            "Admin"}
        </p>
        <p className="text-[10px] text-white/40 uppercase tracking-widest truncate">
          {user?.primaryEmailAddress?.emailAddress || "Master Access"}
        </p>
      </div>
    </div>
  );
}
