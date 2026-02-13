'use client'

import { apiClient } from "@/lib/api";
import { API_ROUTES, SearchUser } from "@travel-planner/shared";
import { useEffect, useState } from "react";
import { Avatar } from "./ui";

export function FriendSearchBar() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);

  useEffect(() => {
    if (search.length <= 0) return;

    apiClient.get<SearchUser[]>(API_ROUTES.USERS.SEARCH(search)).then((res) => {
      setUsers(res);
    }).catch((err) => {
      console.error(err);
    })
  }, [search])

  return (
    <div className="flex relative items-center bg-popover p-4 pl-8 w-3/5 border-2 border-border rounded-full text-lg">
      <span className="text-muted-foreground pr-1">@</span>
      <input
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Username"
        className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
      />
      {users.length > 0 && (
        <div className="absolute left-0 top-full mt-2 w-full bg-popover border-2 border-border rounded-lg shadow-lg z-10">
          {users.map((user) => (
            <div key={user.id} className="flex items-center px-4 py-2 hover:bg-secondary cursor-pointer gap-3">
              <Avatar
                src={user.profile?.profilePicture || ''}
                alt={user.username}
                fallback={user.username || user.profile.firstName || user.profile.lastName}
                size="sm"
              />
              <span className="ml-2">{user.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}