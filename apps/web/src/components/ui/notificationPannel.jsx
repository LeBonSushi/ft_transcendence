"use client"



export function NotificationPannel() {
    const notif = ["heyyyy", "textttttttttt"]
    return (
        <>
            <div className="w-100 h-200 bg-white border rounded-xl">
                {notif.map((item, index) => (
                    <div key={index}> 
                        <p className="text-black text-lg">{item}</p>
                    </div>
                ))}
            </div>
        </>
    )
}