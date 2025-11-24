import LoginForm from "./components/LoginForm";
import LoginInput from "./components/LoginInput";

export default function Home() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-fuchsia-500 via-fuchsia-700 to-blue-700 font-sans dark:bg-black">
			<main className="flex flex-col bg-white items-center justify-center rounded-lg shadow-lg p-24">
				<LoginForm>
					<LoginInput type="text" placeholder="Username or Email" />
					<LoginInput type="password" placeholder="Password" />
				</LoginForm>
			</main>
		</div>
  );
}
