"use client"
import { cn, getInitials } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Session } from 'next-auth'

const Header = ({ session }: { session: Session }) => {
    const pathname = usePathname();

  return (
    <header className='my-10 flex justify-between gap-5 text-white'>
        <Link href='/'>
            <Image src='/icons/logo.svg' width={40} height={40} alt='logo' />
        </Link>

        <ul className='flex flex-row items-center gap-8'>
            <li>
                <Link href="/library" className={cn('text-base cursor-pointer capitalize', pathname === '/library' ? 'text-light-200' : 'text-light-100')}>
                    Library
                </Link>
            </li>

            <li>
                <Link href='/my-profile'>
                    <Avatar className="h-10 w-10">
                        <AvatarFallback className='bg-amber-100 text-black text-base font-bold'>
                            {getInitials(session?.user?.name || 'IN')}
                        </AvatarFallback>
                    </Avatar>
                </Link>
            </li>
        </ul>
    </header>
  )
}

export default Header
