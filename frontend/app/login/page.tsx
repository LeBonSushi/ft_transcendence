'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Inter, Poppins } from 'next/font/google';
import { Card, Button, TextField, Divider, ButtonBase, IconButton } from '@mui/material';
import { useState } from 'react';
import { callApi } from '@shared'

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '700'] });


export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		const res = await callApi('POST', '/auth/login', {
			email: email,
			password: password,
		});
		console.log("Login API call response: ", res);
	}
	
	return (
		<div className="h-screen w-screen bg-gradient-to-br from-sky-500 to-purple-500 justify-center items-center flex p-4">
			<div className="w-full max-w-4xl h-[600px] flex justify-center items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
				<div className="hidden md:inline md:w-1/3 h-full relative">
					<Image src={'/login-page.jpg'} alt="login-page" fill className="object-cover" priority />
				</div>
				<div className="md:w-2/3 w-full h-full flex justify-center items-center p-8">
					<Card
						elevation={0}
						className="w-full max-w-md flex flex-col justify-center items-center p-10 gap-6"
					>
						<h1 className={`text-2xl font-bold ${poppins.className}`}>Login</h1>
						<form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
							<TextField label="Email" variant="outlined" fullWidth onChange={(e) => setEmail(e.target.value)} />

							<TextField label="Password" type="password" variant="outlined" fullWidth onChange={(e) => setPassword(e.target.value)} />
							<Button
								color="primary"
								type='submit'
								variant="contained"
								className={`${poppins.className}`}
								fullWidth
							>
								Login
							</Button>
						</form>
						<p className={`text-sm ${poppins.className}`}>
							Don't have an account?{' '}
							<Link href="/register" className={`text-blue-500 hover:underline`}>
								Register
							</Link>
						</p>

						<Divider className="w-[120%]" variant="middle">
							<span className="text-gray-500 text-sm">Or continue with</span>
						</Divider>

						<div className="w-full flex gap-4 -my-2 justify-center">
							<IconButton size="medium" sx={{ border: '1px solid #e0e0e0' }}>
								<Image src="/google.svg" alt="Google" width={16} height={16} />
							</IconButton>
							<IconButton size="medium" sx={{ border: '1px solid #e0e0e0' }}>
								<Image src="/github.svg" alt="GitHub" width={16} height={16} />
							</IconButton>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
