'use client';

import Image from "next/image";
import Link from "next/link";

import { Card, Button } from "@mui/material";

export default function LoginPage() {
	return (
		<div className="h-screen w-screen bg-gradient-to-br from-sky-500 to-purple-500 justify-center items-center flex p-4">
			<div className="w-full max-w-4xl h-[600px] flex justify-center items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
				<div className="w-1/3 h-full relative">
					<Image 
						src={'/login-page.jpg'} 
						alt="login-page" 
						fill
						className="object-cover"
						priority
					/>
				</div>
				<div className="w-2/3 h-full flex justify-center items-center p-8">
					<Card elevation={0} className="w-full max-w-md flex flex-col justify-center items-center p-10 gap-6">
						<h1 className="text-2xl font-bold">Login</h1>
						<input
							type="text"
							placeholder="Username"
							className="w-full p-2 border border-gray-300 rounded"
						/>
						<input
							type="password"
							placeholder="Password"
							className="w-full p-2 border border-gray-300 rounded"
						/>
						<Button color="primary" variant="contained" fullWidth>
							Login
						</Button>
						<p className="text-sm">
							Don't have an account?{" "}
							<Link href="/register" className="text-blue-500 hover:underline">
								Register
							</Link>
						</p>
					</Card>
				</div>
			</div>
		</div>
	)
}