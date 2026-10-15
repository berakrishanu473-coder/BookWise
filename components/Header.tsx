import { cn, getInitials } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
// import { usePathname } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Session } from 'next-auth'
import { Button } from './ui/button'
import { signOut } from '@/auth'

const Header = async({ session }: { session: Session }) => {
    // const pathname = usePathname();

  return (
    <header className='my-10 flex justify-between gap-5 text-white'>
        <Link href='/'>
            <Image src='/icons/logo.svg' width={40} height={40} alt='logo' />
        </Link>

        <ul className='flex flex-row items-center gap-8'>
        <form
            action={async () => {
                'use server';

                await signOut();
            }}
            className='mt-6 mb-7 flex justify-end'
        >
        <Button 
            type='submit' 
            className='text-black book-overview_btn font-bebas-neue text-xl w-40'>
            Logout
        </Button>
      </form>

            <li>
                <Link href='/my-profile'>
                    <Avatar className="h-12 w-12">
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
