"use client";

interface ProfileFieldProps {
	label: string;
	onChange: (value: string) => void;
	type?: "text" | "email" | "textarea";
	placeholder?: string;
	multiline?: boolean;
	rows?: number;
}

export default function ProfileField({
	label,
	onChange,
	type = "text",
	placeholder,
	multiline = false,
	rows = 3,
}: ProfileFieldProps) {
	return (
		<div className="mb-4">
			<label className="block text-sm font-semibold mb-2">{label}</label>
			{multiline ? (
				<textarea
					className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					rows={rows}
				/>
			) : (
				<input
					type={type}
					className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
				/>
			)}
		</div>
	);
}
