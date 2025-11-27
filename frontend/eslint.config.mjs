defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["../backend/**", "../shared/**"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"]
      }
    }
  },

  globalIgnores(
	"../node_modules/**",
	"../dist/**",
	"../build/**",
	"../.next/**"
  )
])
