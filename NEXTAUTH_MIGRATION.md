# SessionProvider wrapper pour NextAuth

Pour utiliser NextAuth dans votre application, vous devez envelopper votre layout avec le SessionProvider.

## Instructions

Ajoutez le SessionProvider à votre [layout.tsx](apps/web/src/app/layout.tsx):

```tsx
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${playfair.variable} ${dmSans.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProvider session={session}>
            <SocketProvider>
              {children}
            </SocketProvider>
          </SessionProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Backend: Ajouter un endpoint de login

Créez un endpoint dans votre backend pour gérer l'authentification par credentials:

```typescript
// apps/backend/src/modules/auth/auth.controller.ts
@Post('login')
@Public()
async login(@Body() loginDto: { email: string; password: string }) {
  const user = await this.usersService.validateCredentials(loginDto.email, loginDto.password);
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }
  return user;
}
```

## Variables d'environnement

N'oubliez pas de configurer vos variables d'environnement:

- `NEXTAUTH_SECRET`: Secret pour signer les tokens JWT
- `NEXTAUTH_URL`: URL de votre application (ex: http://localhost:3000)
- `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`: Pour OAuth Google
- `GITHUB_CLIENT_ID` et `GITHUB_CLIENT_SECRET`: Pour OAuth GitHub

## Dépendances manquantes

Installez les dépendances nécessaires:

```bash
cd apps/web
pnpm add bcryptjs
pnpm add -D @types/bcryptjs

cd ../backend
pnpm add jsonwebtoken
pnpm add -D @types/jsonwebtoken
```
