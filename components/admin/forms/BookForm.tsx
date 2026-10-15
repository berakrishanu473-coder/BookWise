'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { 
    useForm, 
    Controller, 
} from "react-hook-form";
import z from "zod/v3";

import {
  CardContent,
} from "@/components/ui/card"

import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation";
import { bookSchema } from "@/lib/validations";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import ColorPicker from "../ColorPicker";
import { createBook } from "@/lib/admin/actions/book";
import { toast } from "@/components/ui/toast";

interface Props extends Partial<Book> {
    type?: 'create' | 'update'
}

const BookForm = ({ 
    type, 
    ...book
}: Props) => {

    const router = useRouter();

    const form = useForm<z.infer<typeof bookSchema>>({
        resolver: zodResolver(bookSchema),
        defaultValues: {
            title: "",
            description: "",
            author: "",
            genre: "",
            rating: 1,
            totalCopies: 1,
            coverUrl: "",
            coverColor: "",
            videoUrl: "",
            summary: "",
        },
    })
 
    const onSubmit = async (values: z.infer<typeof bookSchema>) => {
        const result = await createBook(values);

        if(result.success) {
            toast.add({
                title: 'Success',
                description: 'Book created successfully'
            });

            router.push(`/admin/books/${result.data.id}`);
        } else {
            toast.add({
                title: 'Error',
                description: result.message,
            })
        }
    }

    return (
    <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FieldGroup>
                <Controller
                    name={"title"}
                    control={form.control}
                    render={({ field }) => (
                    <Field className="flex flex-col gap-1">
                        <FieldLabel className="text-base font-normal text-dark-500">
                            Book Title
                        </FieldLabel>
                        <Input
                            {...field}
                            required
                            placeholder="Book title"
                            className="book-form_input"
                            autoComplete="off"
                        />
                    </Field>
                )}
                />
            </FieldGroup>

            <FieldGroup>
                <Controller
                    name={"author"}
                    control={form.control}
                    render={({ field }) => (
                    <Field className="flex flex-col gap-1">
                        <FieldLabel className="text-base font-normal text-dark-500">
                            Author
                        </FieldLabel>
                        <Input
                            {...field}
                            required
                            placeholder="Book author"
                            className="book-form_input"
                            autoComplete="off"
                        />
                    </Field>
                )}
                />
            </FieldGroup>

            <FieldGroup>
                <Controller
                    name={"genre"}
                    control={form.control}
                    render={({ field }) => (
                    <Field className="flex flex-col gap-1">
                        <FieldLabel className="text-base font-normal text-dark-500">
                            Genre
                        </FieldLabel>
                        <Input
                            {...field}
                            required
                            placeholder="Book genre"
                            className="book-form_input"
                            autoComplete="off"
                        />
                    </Field>
                )}
                />
            </FieldGroup>

            <FieldGroup>
                <Controller
                    name={"rating"}
                    control={form.control}
                    render={({ field }) => (
                    <Field className="flex flex-col gap-1">
                        <FieldLabel className="text-base font-normal text-dark-500">
                            Rating
                        </FieldLabel>
                        <Input
                            type="number"
                            min={1}
                            max={5}
                            {...field}
                            required
                            placeholder="Book rating"
                            className="book-form_input"
                            autoComplete="off"
                        />
                    </Field>
                )}
                />
            </FieldGroup>

            <FieldGroup>
                <Controller
                    name={"totalCopies"}
                    control={form.control}
                    render={({ field }) => (
                    <Field className="flex flex-col gap-1">
                        <FieldLabel className="text-base font-normal text-dark-500">
                            Total Copies
                        </FieldLabel>
                        <Input
                            type="number"
                            min={1}
                            max={10000}
                            {...field}
                            required
                            placeholder="Total Book Copies"
                            className="book-form_input"
                            autoComplete="off"
                        />
                    </Field>
                )}
                />
            </FieldGroup>

            <FieldGroup>
                <Controller
                    name={"coverUrl"}
                    control={form.control}
                    render={({ field }) => (
                    <Field className="flex flex-col gap-1">
                        <FieldLabel className="text-base font-normal text-dark-500">
                            Book Image
                        </FieldLabel>
                        <FileUpload
                            type="image"
                            accept="image/*"
                            placeholder="Upload a book cover"
                            folder="books/covers"
                            variant="light"
                            onUpload={(url) => {
                                field.onChange(url);
                            }}
                        />
                    </Field>
                )}
                />
            </FieldGroup>

            <FieldGroup>
                <Controller
                    name={"coverColor"}
                    control={form.control}
                    render={({ field }) => (
                    <Field className="flex flex-col gap-1">
                        <FieldLabel className="text-base font-normal text-dark-500">
                            Primary Color
                        </FieldLabel>
                        <ColorPicker
                            onPickerChange={field.onChange}
                            value={field.value}
                        />
                    </Field>
                )}
                />
            </FieldGroup>

            <FieldGroup>
                <Controller
                    name={"description"}
                    control={form.control}
                    render={({ field }) => (
                    <Field className="flex flex-col gap-1">
                        <FieldLabel className="text-base font-normal text-dark-500">
                            Book Description
                        </FieldLabel>
                        <Textarea 
                          placeholder="Book description"
                          {...field}
                          rows={10}
                          className="book-form_input"
                        />
                    </Field>
                )}
                />
            </FieldGroup>

            <FieldGroup>
                <Controller
                    name={"videoUrl"}
                    control={form.control}
                    render={({ field }) => (
                    <Field className="flex flex-col gap-1">
                        <FieldLabel className="text-base font-normal text-dark-500">
                            Book Trailer
                        </FieldLabel>
                        <FileUpload
                            type="video"
                            accept="video/*"
                            placeholder="Upload a book trailer"
                            folder="books/videos"
                            variant="light"
                            onUpload={(url) => {
                                field.onChange(url);
                            }}
                        />
                    </Field>
                )}
                />
            </FieldGroup>

            <FieldGroup>
                <Controller
                    name={"summary"}
                    control={form.control}
                    render={({ field }) => (
                    <Field className="flex flex-col gap-1">
                        <FieldLabel className="text-base font-normal text-dark-500">
                            Book Summary
                        </FieldLabel>
                        <Textarea 
                          placeholder="Book summary"
                          {...field}
                          rows={5}
                          className="book-form_input"
                        />
                    </Field>
                )}
                />
            </FieldGroup>

            <Button type="submit" className='book-form_btn text-white'>
                Add Book to Library
            </Button>
        </form>
      </CardContent>
  )
}

export default BookForm
