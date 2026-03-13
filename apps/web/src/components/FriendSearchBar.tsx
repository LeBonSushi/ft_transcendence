'use client'

import { apiClient } from "@/lib/api";
import { API_ROUTES, SearchUser } from "@travel-planner/shared";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { UserRoundPlus } from "lucide-react";
import { Avatar } from "./ui";
import { motion } from "motion/react";
import { useClickOutside } from "@/hooks";

export function FriendSearchBar() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useClickOutside(searchRef, () => setShowResults(false), showResults);

  useEffect(() => {
    if (search.length < 1) {
      setUsers([]);
      setShowResults(false);
      return;
    }

    apiClient.get<SearchUser[]>(API_ROUTES.USERS.SEARCH(search)).then((res) => {
      setUsers(res);
      setShowResults(res.length > 0);
      setErrorMessage(null);
    }).catch((err) => {
      console.error(err);
    })
  }, [search])

  const handleAddFriend = async (userId: string) => {
    try {
      setErrorMessage(null);
      await apiClient.post(API_ROUTES.FRIENDS.SEND(userId))
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const apiMessage = typeof e.response?.data?.message === 'string'
          ? e.response.data.message
          : null;

        if (e.response?.status === 403 && apiMessage === 'Friend request already exists') {
          setErrorMessage('A friend request has already been sent to this user.');
          return;
        }

        if (e.response?.status === 404 && apiMessage === 'Already friends') {
          setErrorMessage('You are already friends with this user.');
          return;
        }

        if (apiMessage) {
          setErrorMessage(apiMessage);
          return;
        }
      }

      setErrorMessage('Unable to send the friend request right now.');
    }
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="flex items-center bg-popover p-2 sm:p-4 pl-3 sm:pl-8 w-full border-2 border-border rounded-full text-sm sm:text-lg">
        <span className="text-muted-foreground pr-1">@</span>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            if (errorMessage) setErrorMessage(null)
          }}
          onFocus={() => users.length > 0 && setShowResults(true)}
          placeholder="Username"
          className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>
      {errorMessage && (
        <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {errorMessage}
        </div>
      )}
      {showResults && users.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } }}
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
              <button className="flex ml-auto p-2 rounded-full bg-accent text-primary-foreground hover:bg-primary/85 cursor-pointer"
                onClick={(async) => handleAddFriend(user.id)}>
                <UserRoundPlus className="pl-0.5 h-4 w-4" />
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}