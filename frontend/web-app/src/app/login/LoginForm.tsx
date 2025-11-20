import { ReactNode } from 'react';

export default function LoginForm({ children }: { children: ReactNode }) {
	return (
		<div className="bg-white">
			{children}
		</div>
	);
}