"use client";

import { formatTimeAgo } from "../../../app/utils/formatTimeAgo";

interface RoomCardProps {
	name: string;
	lastMessage: string | null;
	senderUsername: string | null;
	senderPicture: string | null;
	lastMessageDate?: string | Date | null;
	onClick?: () => void;
}

export default function RoomCard({
	name,
	lastMessage,
	senderUsername,
	senderPicture,
	lastMessageDate,
	onClick,
}: RoomCardProps) {
	return (
		<div className="mb-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer" onClick={onClick}>
			<div className="p-3">
				<div className="flex gap-3 items-center">
					{/* Avatar */}
					<div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
						{senderPicture ? (
							<img src={senderPicture} alt={senderUsername || "Unknown"} className="w-full h-full object-cover" />
						) : (
							<span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
								{senderUsername?.charAt(0).toUpperCase() || "?"}
							</span>
						)}
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0">
						{/* Header */}
						<div className="flex items-center gap-2 mb-1">
							<h3 className="text-base font-semibold flex-1 truncate">{name}</h3>
							{lastMessageDate && (
								<span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
									{formatTimeAgo(lastMessageDate)}
								</span>
							)}
						</div>

						{/* Last Message */}
						<p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
							{lastMessage || "Pas de messages"}
						</p>

						{/* Sender */}
						{senderUsername && (
							<span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
								{senderUsername}
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
