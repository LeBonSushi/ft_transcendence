'use client';

import { useState, useEffect } from 'react';

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
        setUser(res.user);
        toast.success('Logged in successfully!');
      }}>Login</Button>

      <Button onClick={async (e) => {
        e.preventDefault();
        const user = await authApi.loginWithGoogle();
        setUser(user);
        toast.success('Logged in with Google!');
      }}>Login with Google</Button>

      <Button onClick={async (e) => {
        e.preventDefault();
        const user = await authApi.loginWithGithub();
        setUser(user);
        toast.success('Logged in with Github!');
      }}>Login with Github</Button>

      <Button onClick={async (e) => {
        e.preventDefault();
        const user = await authApi.loginWith42();
        setUser(user);
        toast.success('Logged in with 42!');
      }}>Login with 42</Button>

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
