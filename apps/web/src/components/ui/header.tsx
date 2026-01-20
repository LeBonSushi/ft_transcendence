// 'use client';

// import { useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { ThemeToggleItem } from '@/components/ui/theme-toggle';
// import { Button } from '@/components/ui/button';
// import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
// import { useTheme } from 'next-themes';
// import UserProfile from './user-profile';

// export default function Header() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system');
//   const { setTheme } = useTheme();


//   return (
//     <>
//       {/* HEADER */}
//       <header className="flex items-center justify-between py-7 px-9 bg-muted border-b border-border">
//         {/* Burger */}
//         <button
//           onClick={() => setMenuOpen(true)}
//           className="md:hidden"
//         >
//           <Image
//             src="/header_button.svg"
//             alt="Menu"
//             width={40}
//             height={40}
//           />
//         </button>

//         {/* Theme */}
//         <Button
//           onClick={() => {
//             const newTheme = currentTheme === 'light' ? 'dark' : 'light';
//             setCurrentTheme(newTheme);
//             setTheme(newTheme);
//           }}
//         >
//           Change Theme
//         </Button>

//         {/* Desktop menu */}
//         <div className="hidden md:flex gap-4">
//           <SignedOut>
//             <Button>
//               <Link href="/sign-in">Sign In</Link>
//             </Button>
//             <Button>
//               <Link href="/sign-up">Sign Up</Link>
//             </Button>
//           </SignedOut>

//           <SignedIn>
//             <UserProfile />
//           </SignedIn>
//         </div>
//       </header>

//       {/* OVERLAY */}
//       {menuOpen && (
//         <div
//           onClick={() => setMenuOpen(false)}
//           className="fixed inset-0 bg-black/50 z-40 md:hidden"
//         />
//       )}

//       {/* MENU OFF-CANVAS */}
//       <nav
//         className={`
//           fixed top-0 left-0 z-50
//           h-screen w-4/5 max-w-xs
//           bg-muted
//           transform transition-transform duration-300 ease-in-out
//           ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
//           md:hidden
//         `}
//       >
//         <div className="p-6 flex flex-col gap-6">
//           {/* Close */}
//           <button
//             onClick={() => setMenuOpen(false)}
//             className="self-end text-lg"
//           >
//             ✕
//           </button>

//           <SignedOut>
//             <Button onClick={() => setMenuOpen(false)}>
//               <Link href="/sign-in">Sign In</Link>
//             </Button>
//             <Button onClick={() => setMenuOpen(false)}>
//               <Link href="/sign-up">Sign Up</Link>
//             </Button>
//           </SignedOut>

//           <SignedIn>
//             <UserButton />
//           </SignedIn>
//         </div>
//       </nav>
//     </>
//   );
// }
