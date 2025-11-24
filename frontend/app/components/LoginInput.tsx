'use client';

type LoginInputProps = {
  type: 'text' | 'password';
  placeholder?: string;
};

export default function LoginInput({ type, placeholder }: LoginInputProps) {
  return (
	
    <input
		onFocus={() => { console.log("OnFocus LoginInput"); }}
		onBlur={() => { console.log("OnBlur LoginInput"); }}
		type={type}
		className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
		placeholder={placeholder}
    />
  );
}
