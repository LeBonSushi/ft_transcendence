export default function LoginForm({ children }: { children: React.ReactNode }) {
	return <form className="flex flex-col gap-4 w-full">{children}</form>;
}