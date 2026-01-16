"use client";

interface ProfileDisplayProps {
	username: string;
	email: string;
	firstName?: string;
	lastName?: string;
	bio?: string;
	profilePicture?: string;
}

export default function ProfileDisplay({
	username,
	email,
	firstName,
	lastName,
	bio,
	profilePicture,
}: ProfileDisplayProps) {
	return (
		<div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
			<div className="flex items-center gap-6">
				{/* Avatar */}
				<div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
					{profilePicture ? (
						<img src={profilePicture} alt={username} className="w-full h-full object-cover" />
					) : (
						<span className="text-3xl font-semibold text-gray-600 dark:text-gray-300">
							{username?.charAt(0).toUpperCase()}
						</span>
					)}
				</div>

				{/* User Info */}
				<div className="flex-1">
					<h2 className="text-2xl font-bold mb-1">
						{firstName && lastName ? `${firstName} ${lastName}` : username}
					</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{username}</p>
					<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{email}</p>
					{bio && (
						<p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">{bio}</p>
					)}
				</div>
			</div>
		</div>
	);
}
