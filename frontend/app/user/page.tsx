"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const USER_ID = 1; // Temporairement hardcodé, à remplacer par l'ID réel

export default function UserPage() {
    const [message, setMessage] = useState<string>("...");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [saving, setSaving] = useState<boolean>(false);
    const [successMsg, setSuccessMsg] = useState<string>("");

    // État pour les champs modifiables
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [bio, setBio] = useState<string>("");

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`${API_URL}/user/${USER_ID}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                
                const text = await res.text();
                if (!text) throw new Error("Response vide du serveur");
                
                const data = JSON.parse(text);
                setMessage(JSON.stringify(data));
                
                // Remplir les champs avec les données actuelles
                setUsername(data.username || "");
                setEmail(data.email || "");
                setFirstName(data.profile?.firstName || "");
                setLastName(data.profile?.lastName || "");
                setBio(data.profile?.bio || "");
            } catch (e: any) {
                setError(e?.message ?? "Erreur inconnue");
                console.error("Erreur fetch:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccessMsg("");

        try {
            const res = await fetch(`${API_URL}/user/${USER_ID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    email,
                    firstName,
                    lastName,
                    bio,
                }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const text = await res.text();
            if (!text) throw new Error("Response vide du serveur");

            const updatedUser = JSON.parse(text);
            setMessage(JSON.stringify(updatedUser));
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 20 }}>
            <h1>User Page</h1>
            {loading && <p>Chargement...</p>}
            {error && <p style={{ color: "red" }}>Erreur: {error}</p>}
            {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

            {!loading && !error && (() => {
                try {
                    const user = JSON.parse(message);
                    return (
                        <div>
                            {/* Affichage du profil */}
                            <div style={{ marginBottom: 30, padding: 15, backgroundColor: "#f0f0f0", borderRadius: 8 }}>
                                <h2>Profil Actuel</h2>
                                {user.profile?.avatar && (
                                    <img
                                        src={user.profile.avatar}
                                        alt="Avatar"
                                        style={{ width: 100, height: 100, borderRadius: "50%", marginBottom: 15 }}
                                    />
                                )}
                                <p><strong>Username:</strong> {user.username}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Prénom:</strong> {user.profile?.firstName}</p>
                                <p><strong>Nom:</strong> {user.profile?.lastName}</p>
                                <p><strong>Bio:</strong> {user.profile?.bio}</p>
                            </div>

                            {/* Formulaire de modification */}
                            <div style={{ padding: 15, backgroundColor: "#fff9e6", borderRadius: 8 }}>
                                <h2>Modifier le Profil</h2>

                                <div style={{ marginBottom: 12 }}>
                                    <label>Username:</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc" }}
                                    />
                                </div>

                                <div style={{ marginBottom: 12 }}>
                                    <label>Email:</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc" }}
                                    />
                                </div>

                                <div style={{ marginBottom: 12 }}>
                                    <label>Prénom:</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc" }}
                                    />
                                </div>

                                <div style={{ marginBottom: 12 }}>
                                    <label>Nom:</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc" }}
                                    />
                                </div>

                                <div style={{ marginBottom: 12 }}>
                                    <label>Bio:</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc", minHeight: 80 }}
                                    />
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: saving ? "#ccc" : "#4CAF50",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 4,
                                        cursor: saving ? "not-allowed" : "pointer",
                                        fontSize: 16,
                                    }}
                                >
                                    {saving ? "Enregistrement..." : "Enregistrer"}
                                </button>
                            </div>
                        </div>
                    );
                } catch {
                    return <p style={{ color: "red" }}>❌ Erreur de parsing</p>;
                }
            })()}
        </div>
    );
}