'use client'

import { Input } from "@headlessui/react"
import { useState } from "react";

export default function LoginInput() {
	const [email, setEmail] = useState('');
	// const isInvalid = !Validators.isValidEmail(email);
	const isInvalid = false;
	
	return (
		<Input 
			name="email" 
			type="email" 
			value={email}
			onChange={(e) => setEmail(e.target.value)}
			invalid={isInvalid}
		/>
	)
}