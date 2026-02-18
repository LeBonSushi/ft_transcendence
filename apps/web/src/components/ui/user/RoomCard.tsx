interface RoomCardProps {
  key: string;
  id: string;
  name: string;
  lastMessage: string | null;
  lastMessageDate: Date | null;
  senderUsername: string | null;
  senderPicture: string | null;
  createdAt?: Date;
  onClick?: () => void;
}

export function RoomCard({ id, name, lastMessage, lastMessageDate, senderUsername, senderPicture, createdAt, onClick } : RoomCardProps) {
  return (
    <div className="flex flex-col w-full p-8 bg-muted rounded-lg cursor-pointer" onClick={onClick}>
      <div>{name}</div>
    </div>
  )
}