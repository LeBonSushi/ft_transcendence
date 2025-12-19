'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

export default function login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('alice');
  const [password, setPassword] = useState<string>('password123');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [register, setRegister] = useState<boolean>(false);

  return (
    <div className='w-screen h-screen bg-white flex flex-col items-center justify-center'>
      <Card className='flex min-w-2/3 min-h-3/4 bg-gray-100 shadow-md overflow-hidden items-center justify-center'>
        {/* <Card>
        </Card> */}
        <div className='w-2/5 h-full hidden md:inline relative'>
          <Image src={'/login.jpg'} alt="Login Image" className='object-cover' priority fill/>
        </div>
        <div className='w-full md:w-3/5 h-full p-12 flex flex-col items-center'> {/* Login Form */ }
          <h2 className='text-[clamp(1.125rem,1.25rem+0.25vw,2.5rem)] text-nowrap font-bold mb-8'>Login to Your Account</h2>
        </div>
      </Card>
    </div>
  )
}
