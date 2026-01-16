"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import RoomCard from "../../components/RoomCard";
import ProfileField from "../../components/ProfileField";
import ProfileDisplay from "../../components/ProfileDisplay";
import { usersApi } from "@/lib/api/users";
import type { User, RoomSummary } from "@travel-planner/shared";

export default function UserPage() {
	const router = useRouter();
	const { user: clerkUser } = useUser();
	const userId = clerkUser?.id;
	const [userData, setUserData] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [saving, setSaving] = useState<boolean>(false);
	const [successMsg, setSuccessMsg] = useState<string>("");

	const [username, setUsername] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [firstName, setFirstName] = useState<string>("");
	const [lastName, setLastName] = useState<string>("");
	const [bio, setBio] = useState<string>("");
	const [profilePicture, setProfilePicture] = useState<string>("");
	const [rooms, setRooms] = useState<RoomSummary[]>([]);

	useEffect(() => {
    console.log(userId);
		const fetchUser = async () => {
			setLoading(true);
			setError("");
			try {
				if (!clerkUser?.id) {
					setError("Utilisateur non connecté");
					return;
				}

				const userDetails = await usersApi.getUser(clerkUser.id);
				const userRooms = await usersApi.getUserRooms(clerkUser.id);

				setUserData(userDetails);
				setRooms(userRooms ?? []);


        console.log("userDetails", userDetails);
				setUsername(userDetails.username || "");
				setEmail(userDetails.email || "");
				setFirstName(userDetails.profile?.firstName || "");
				setLastName(userDetails.profile?.lastName || "");
				setBio(userDetails.profile?.bio || "");
				setProfilePicture(userDetails.profile?.profilePicture || "");
			} catch (e: any) {
				setError(e?.message ?? "Erreur inconnue");
				console.error("Erreur fetch:", e);
			} finally {
				setLoading(false);
			}
		};
		fetchUser();
	}, [clerkUser]);

	const handleSave = async () => {
		setSaving(true);
		setError("");
		setSuccessMsg("");

		try {
			if (!userData) return;

			const updateData: Record<string, string> = {};
			
			if (username?.trim() && username !== userData.username)
				updateData.username = username.trim();
			if (email?.trim() && email !== userData.email)
				updateData.email = email.trim();
			else
				
			if (firstName?.trim() && firstName !== (userData.profile?.firstName || ""))
				updateData.firstName = firstName.trim();
			if (lastName?.trim() && lastName !== (userData.profile?.lastName || ""))
				updateData.lastName = lastName.trim();
			if (bio?.trim() && bio !== (userData.profile?.bio || ""))
				updateData.bio = bio.trim();
			if (profilePicture?.trim() && profilePicture !== (userData.profile?.profilePicture || ""))
				updateData.profilePicture = profilePicture.trim();

			if (Object.keys(updateData).length === 0) {
				setSuccessMsg("Aucune modification détectée");
				return;
			}

			if (!clerkUser?.id) {
				setError("Utilisateur non connecté");
				return;
			}

			console.log("infos send", updateData);
			const response = await usersApi.updateUser(clerkUser.id, updateData);

			const updatedUser = response.user;
			setUserData(updatedUser);

			if (response.warnings && response.warnings.length > 0) {
				console.log('Warnings:', response.warnings);
			}

			setSuccessMsg("Profil mis à jour avec succès !");
			setTimeout(() => setSuccessMsg(""), 3000);
		} catch (e: any) {
			setError(`Erreur lors de la sauvegarde: ${e?.message ?? "Inconnue"}`);
			console.error("Erreur save:", e);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="container max-w-7xl mx-auto py-8 px-4">
			{loading && (
				<div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg">
					Chargement...
				</div>
			)}
			{error && (
				<div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
					{error}
				</div>
			)}
			{successMsg && (
				<div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg">
					{successMsg}
				</div>
			)}

			{!loading && !error && userData && (() => {
				try {
					const user = userData;
					return (
						<>
							{/* Main Grid: Left (Profile + Edit) + Right (Messages full height) */}
							<div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 min-h-[70vh]">
								{/* Left Column: Profile + Edit */}
								<div className="flex flex-col gap-6">
									{/* Profile Display */}
									<ProfileDisplay
										username={user.username}
										email={user.email}
										firstName={user.profile?.firstName}
										lastName={user.profile?.lastName}
										bio={user.profile?.bio}
										profilePicture={user.profile?.profilePicture}
									/>


									{/* Edit Profile Form */}
									<div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
										<h3 className="text-xl font-bold mb-4">Modifier le Profil</h3>
										<ProfileField
											label="Username"
											onChange={setUsername}
											type="text"
										/>
										<ProfileField
											label="Email"
											onChange={setEmail}
											type="email"
										/>
										<ProfileField
											label="Prénom"
											onChange={setFirstName}
											type="text"
										/>
										<ProfileField
											label="Nom"
											onChange={setLastName}
											type="text"
										/>
										<ProfileField
											label="Bio"
											onChange={setBio}
											type="textarea"
											multiline
											rows={4}
										/>
										<ProfileField
											label="Photo de profil (URL)"
											onChange={setProfilePicture}
											type="text"
											placeholder="https://exemple.com/image.jpg"
										/>
										<Button
											onClick={handleSave}
											disabled={saving}
											className="w-full mt-4"
										>
											{saving ? "Enregistrement..." : "Enregistrer"}
										</Button>
									</div>
								</div>

								{/* Right Column: Messages (full height) */}
								<div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 flex flex-col">
									<h2 className="text-xl font-bold mb-4">Mes Conversations</h2>
									{rooms.length === 0 ? (
										<p className="text-gray-500 dark:text-gray-400">
											Aucune conversation pour le moment
										</p>
									) : (
										<div className="flex-1 overflow-y-auto">
											{rooms.map((room, idx) => (
												<div key={idx} className="mb-3">
													<RoomCard
														name={room.name}
														lastMessage={room.lastMessage}
														senderUsername={room.senderUsername}
														senderPicture={room.senderPicture}
														lastMessageDate={room.lastMessageDate || room.createdAt}
														onClick={() => router.push(`/messages?room=${encodeURIComponent(room.name)}`)}
													/>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</>
					);
				} catch {
					return <p className="text-red-600">Erreur de parsing</p>;
				}
			})()}
		</div>
	);
}