import { FriendSearchBar } from "@/components/FriendSearchBar";
import FriendSearchBarServer from "@/components/server/FriendSearchBarServer";

export default function Page() {
  return (
    <div className="flex justify-center h-screen items-center">
      <FriendSearchBarServer/>
    </div>
  )
}