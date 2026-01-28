import { serverUsersApi } from "@/lib/api/users.server";
import RoomClient from "./room-client";

export default async function RoomPage() {
  const rooms = await serverUsersApi.getMyRooms().catch(() => []);
  
  const creatorIds = [...new Set(rooms.map((room: any) => room.creatorId))];
  const usersPromises = creatorIds.map(id => 
    serverUsersApi.getUser(id).getProfile().catch(() => ({ id, username: 'Inconnu' }))
  );
  const users = await Promise.all(usersPromises);
  
  const usernameMap = users.reduce((acc: any, user: any) => {
    acc[user.id] = user.username;
    return acc;
  }, {});

  return <RoomClient initialRooms={rooms} usernameMap={usernameMap} />;
}