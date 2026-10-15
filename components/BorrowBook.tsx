'use client'

import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from './ui/toast'
import { borrowBook } from '@/lib/actions/book'

interface Props {
    userId: string,
    bookId: string,
    borrowingEligibility: {
        isEligible: boolean,
        message: string,
    }
}

const BorrowBook = ({ userId, bookId, borrowingEligibility: { isEligible, message } }: Props) => {

  const router = useRouter();
  const [borrowing, setBorrowing] = useState(false);

  const handleBorrow = async() => {
    if(!isEligible) {
      toast.add({
        title: 'Error',
        description: message,
      });
    }

    setBorrowing(true);

    try {
      const result = await borrowBook({ bookId, userId });

      if(result.success) {
        toast.add({
          title: 'success',
          description: 'Book borrowed successfully',
        });

        router.push('/');
      } else {
        toast.add({
          title: 'Error',
          description: result.error,
        });
      }
    } catch (error) {
      toast.add({
        title: 'Error',
        description: 'An error occurred while borrowing the book',
      });
    } finally {
      setBorrowing(false);
    }
  }


  return (
    <Button className="book-overview_btn" onClick={handleBorrow} disabled={borrowing}>
        <Image src="/icons/book.svg" alt='book' width={30} height={30}/>
        <p className='font-bebas-neue text-xl text-dark-100'>{borrowing ? 'Borrowing...' : 'Borrow Book'} &nbsp;&nbsp;</p>
    </Button>
  )
}

export default BorrowBook
