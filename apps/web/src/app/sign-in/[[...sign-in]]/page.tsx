'use client'

import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'

import { Button } from '@/components/ui/button'

export default function SignInPage() {
  return (
    <div className='h-screen w-screen flex justify-center items-center'>
      <SignIn.Root>
        <SignIn.Step
          name="start"
          className="bg-white w-96 rounded-2xl py-10 px-8 shadow-sm border space-y-6"
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Clerk.Connection
              name="google"
              className="flex items-center gap-x-3 justify-center font-medium border shadow-sm py-1.5 px-2.5 rounded-md"
            >
              <Clerk.Icon className="size-4" />
              Google
            </Clerk.Connection>
            <Clerk.Connection
              name="github"
              className="flex items-center gap-x-3 justify-center font-medium border shadow-sm py-1.5 px-2.5 rounded-md"
            >
              <Clerk.Icon className="size-4" />
              GitHub
            </Clerk.Connection>
          </div>
          <Clerk.Field name="identifier" className="space-y-2">
            <Clerk.Label className="text-sm font-medium">Email</Clerk.Label>
            <Clerk.Input className="w-full border rounded-md py-1.5 px-2.5" />
            <Clerk.FieldError className="block text-red-500 text-sm" />
          </Clerk.Field>
          <SignIn.Action submit className="bg-black text-white rounded-md py-1.5 px-2.5">
            Continue
          </SignIn.Action>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  )
}
