"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function UserPage() {
    const [message, setMessage] = useState<string>("...");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`${API_URL}/user/test`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setMessage(JSON.stringify(data));
            } catch (e: any) {
                setError(e?.message ?? "Erreur inconnue");
            } finally {
                setLoading(false);
            }
        };
        run();
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h1>User Page</h1>
            <p>Appel: {`${API_URL}/user/test`}</p>
            {loading && <p>Chargement...</p>}
            {error && <p style={{ color: "red" }}>Erreur: {error}</p>}
            {!loading && !error && <pre style={{ whiteSpace: "pre-wrap" }}>{message}</pre>}
        </div>
    );
}