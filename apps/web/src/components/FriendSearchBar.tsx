'use client'

import { apiClient } from "@/lib/api";
import { API_ROUTES, SearchUser } from "@travel-planner/shared";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Avatar } from "./ui";
import { motion } from "motion/react";

export function FriendSearchBar() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);

  useEffect(() => {
    if (search.length < 1) {
      setUsers([]);
      return;
    }

    apiClient.get<SearchUser[]>(API_ROUTES.USERS.SEARCH(search)).then((res) => {
      setUsers(res);
    }).catch((err) => {
      console.error(err);
    })
  }, [search])

  return (
    <div className="flex relative items-center bg-popover p-2 sm:p-4 pl-3 sm:pl-8 w-full border-2 border-border rounded-full text-sm sm:text-lg">
      <span className="text-muted-foreground pr-1">@</span>
      <input
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Username"
        className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
      />
      {users.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute left-0 top-full mt-2 w-full bg-popover border-2 border-border rounded-lg shadow-lg z-10">
          {users.map((user) => (
            <div key={user.id} className="flex items-center px-4 py-2 hover:bg-muted cursor-pointer gap-3">
              <Avatar
                pictureColor="bg-accent"
                src={user.profile?.profilePicture || ''}
                alt={user.username}
                fallback={user.username || user.profile.firstName || user.profile.lastName}
                size="sm"
              />
              <span className="ml-2">{user.username}</span>
              <button className="ml-auto p-2 rounded-full bg-accent text-primary-foreground hover:bg-primary/85 cursor-pointer">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}