import LoginForm from "./LoginForm"
import LoginInput from "./LoginInput"

export default function Login() {
	return (
		<div className="h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex justify-center items-center ">
			<LoginForm>
				<LoginInput />
			</LoginForm>
		</div>
	)
}