import { FriendSearchBar } from "@/components/FriendSearchBar";
import FriendSearchBarServer from "@/components/server/FriendSearchBarServer";

export default function Page() {
  return (
    <div className="flex w-full justify-center h-screen items-center">
      <div className="flex w-1/4">
        <FriendSearchBarServer/>
      </div>
    </div>
  )
}