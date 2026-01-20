'use client'

import toast from "react-hot-toast";

export default function Footer() {
    return (
            <footer className="flex items-center justify-between py-7 px-9 bg-muted border-b border-border">
                <div>
                    <button onClick={() => {
                        toast.success("Merci gros fils de pute")
                    }}>
                        ACCEPT LES CONDITIONS CONNARD</button>
                </div>
            </footer>
    )
}