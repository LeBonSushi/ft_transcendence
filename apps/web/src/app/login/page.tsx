'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/auth';
import { toast } from 'sonner';

export default function login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('alice');
  const [password, setPassword] = useState<string>('password123');
  const [user, setUser] = useState<any>(null);

  return (
    <div className='flex '>
      <Button onClick={ async () => {
        const res = await authApi.login({ usernameOrEmail, password });

        console.log('Login response:', res);
        console.log('Cookies after login:', document.cookie);
        toast.success('Logged in successfully!');
      }}>Login</Button>

      <Button onClick={async () => {
        authApi.loginWithGoogle();
      }}>Login with Google</Button>

      <Button onClick={async () => {
        console.log('Cookies before /me:', document.cookie);
        try {
          const res = await authApi.getCurrentUser();
          console.log('User data:', res);
          setUser(res);
        } catch (error) {
          console.error('Error getting user:', error);
        }
      }}>Get Current User</Button>

      <Button onClick={async () => {
        await authApi.logout();
        setUser(null);
        toast.success('Logged out successfully!');
        console.log('Logged out. Cookies after logout:', document.cookie);
      }}>Logout</Button>

      {user &&
      <div>
        <h2>User Info:</h2>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
      }
	  </div>
  )
}
