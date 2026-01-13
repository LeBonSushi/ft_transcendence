"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Box, Button, Alert, Typography, useTheme } from "@mui/material";
import RoomCard from "../../components/RoomCard";
import ProfileField from "../../components/ProfileField";
import ProfileDisplay from "../../components/ProfileDisplay";
import { usersApi } from "@/lib/api/users";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/auth";
import type { User, RoomSummary } from "@travel-planner/shared";

export default function UserPage() {
	const router = useRouter();
	const { user: authUser } = useAuthStore();
	const userId = authUser?.id;
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
		const fetchUser = async () => {
			setLoading(true);
			setError("");
			try {
				let currentUser = authUser;
				if (!currentUser) {
					currentUser = await authApi.getCurrentUser();
					useAuthStore.setState({ user: currentUser });
				}

				const userDetails = await usersApi.getUser(currentUser?.id);
				const userRooms = await usersApi.getUserRooms(currentUser?.id);

				setUserData(userDetails);
				setRooms(userRooms ?? []);

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
	}, [authUser]);

	const handleSave = async () => {
		setSaving(true);
		setError("");
		setSuccessMsg("");

		try {
			if (!userData) return;

			const updateData: Record<string, string> = {};
			
			// Envoyer seulement les champs modifiés
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

			// Ne rien envoyer si aucun changement
			if (Object.keys(updateData).length === 0) {
				setSuccessMsg("Aucune modification détectée");
				// setSaving(false);
				return;
			}

			let currentUser = authUser;
			if (!currentUser) {
				currentUser = await authApi.getCurrentUser();
				useAuthStore.setState({ user: currentUser });
			}

			console.log("infos send", updateData);
			const response = await usersApi.updateUser(currentUser.id, updateData);

			const updatedUser = response.user;
			setUserData(updatedUser);
			useAuthStore.setState({ user: updatedUser });

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

	const theme = useTheme();
	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			{loading && <Alert severity="info">Chargement...</Alert>}
			{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
			{successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

			{!loading && !error && userData && (() => {
				try {
					const user = userData;
					return (
						<>
							{/* Main Grid: Left (Profile + Edit) + Right (Messages full height) */}
							<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 3, minHeight: "70vh" }}>
								{/* Left Column: Profile + Edit */}
								<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
									{/* Profile Display */}
									<Box>
										<ProfileDisplay
											username={user.username}
											email={user.email}
										firstName={user.profile?.firstName}
										lastName={user.profile?.lastName}
										bio={user.profile?.bio}
										profilePicture={user.profile?.profilePicture}
									/>
								</Box>

									{/* Edit Profile Form */}
									<Box sx={{ mb: 3, backgroundColor: theme.palette.primary.main, borderRadius: 3, padding: 2 }}>
										<Box sx={{ mb: 2 }}>
											<h3>Modifier le Profil</h3>
										</Box>
										<ProfileField
											label="Username"
											// value={''}
											onChange={setUsername}
											type="text"
										/>
										<ProfileField
											label="Email"
											// value={''}
											onChange={setEmail}
											type="email"
										/>
										<ProfileField
											label="Prénom"
											// value={''}
											onChange={setFirstName}
											type="text"
										/>
										<ProfileField
											label="Nom"
											// value={''}
											onChange={setLastName}
											type="text"
										/>
										<ProfileField
											label="Bio"
											// value={}
											onChange={setBio}
											type="textarea"
											multiline
											rows={4}
										/>
										<ProfileField
											label="Photo de profil (URL)"
											// value={profilePicture}
											onChange={setProfilePicture}
											type="text"
											placeholder="https://exemple.com/image.jpg"
										/>
										<Button
											variant="contained"
											onClick={handleSave}
											disabled={saving}
											fullWidth
											sx={{ mt: 2, backgroundColor: theme.palette.primary.dark }}
										>
											{saving ? "Enregistrement..." : "Enregistrer"}
										</Button>
									</Box>
								</Box>

								{/* Right Column: Messages (full height) */}
								<Box
									sx={{
										backgroundColor: "#f9f9f9",
										borderRadius: 2,
										padding: 2,
										display: "flex",
										flexDirection: "column",
									}}
								>
									<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
										Mes Conversations
									</Typography>
									{rooms.length === 0 ? (
										<Typography sx={{ color: "#999" }}>
											Aucune conversation pour le moment
										</Typography>
									) : (
										<Box sx={{ flex: 1, overflowY: "auto" }}>
											{rooms.map((room, idx) => (
												<div key={idx} style={{ marginBottom: 12 }}>
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
										</Box>
									)}
								</Box>
							</Box>
						</>
					);
				} catch {
					return <Typography sx={{ color: "red" }}>Erreur de parsing</Typography>;
				}
			})()}
		</Container>
	);
}