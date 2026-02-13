'use client'

import { apiClient } from "@/lib/api";
import { API_ROUTES } from "@travel-planner/shared";
import { useEffect, useState } from "react";

export function FriendSearchBar() {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (search.length <= 0) return;

    const res = apiClient.get<any>(API_ROUTES.USERS.SEARCH(search)).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.error(err);
    })
  }, [search])

  return (
    <div className="flex items-center bg-popover p-4 pl-8 w-3/5 border-2 border-border rounded-full text-lg">
      <span className="text-muted-foreground pr-1">@</span>
      <input
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Username"
        className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
      />

    </div>
  )
}