'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/auth';

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
      }}>Login</Button>

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

      {user &&
      <div>
        <h2>User Info:</h2>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
      }
	  </div>
  )
}
