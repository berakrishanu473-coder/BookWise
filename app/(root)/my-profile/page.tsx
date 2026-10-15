import BookList from '@/components/BookList';
import { sampleBooks } from '@/constants';

const page = () => {
  return (
    <>
      <BookList title='Borrowed Books' books={sampleBooks} />
    </>
  )
}

export default page
