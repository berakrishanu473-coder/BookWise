'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { 
    DefaultValues, 
    FieldValues, 
    SubmitHandler, 
    useForm, 
    UseFormReturn, 
    Controller, 
    Path
} from "react-hook-form";
import { ZodType } from "zod/v3";

import {
  CardContent,
} from "@/components/ui/card"

import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { Button } from "./ui/button";
import Link from "next/link";
import { FIELD_NAMES, FIELD_TYPES } from "@/constants";
import ImageUpload from "./ImageUpload";
import { toast } from "./ui/toast";
import { useRouter } from "next/navigation";

interface Props<T extends FieldValues> {
    type: 'SIGN_IN' | 'SIGN_UP',
    schema: ZodType<T>
    defaultValues: T,
    onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>
}

const AuthForm = <T extends FieldValues>({ 
    type, 
    schema, 
    defaultValues, 
    onSubmit 
}: Props<T>) => {

    const router = useRouter();
    const isSignIn = type === "SIGN_IN";

const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  })
 
  const handleSubmit: SubmitHandler<T> = async(data) => {
    const result = await onSubmit(data);

    if(result.success) {
        toast.add({
            title: 'Success',
            description: isSignIn ?
                'You have successfully signed in.'
                : 'You have successfully signed up',
        });

        router.push('/');

    } else {
        toast.add({
            title: `Error ${isSignIn ? 'signing in' : 'signing up'}`,
            description: result.error || 'An error occurred.',
            type: 'destructive',

        })
    }
  }

    return (
    <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-white">
            {isSignIn ? 'Welcome back to BookWise' : 'Create your library account'}
        </h1>

        <p className="text-light-100">
            {isSignIn ? 'Access the vast collection of resources, and stay updated'
            : 'Please complete all fields and upload a valid university ID to gain access to the library'}
        </p>

      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit, (error) => {console.log(error)})} className="space-y-6 w-full">
            {Object.keys(defaultValues).map((field) => (
                <FieldGroup key={field}>
                    <Controller
                        name={field as Path<T>}
                        control={form.control}
                        render={({ field }) => (
                        <Field>
                            <FieldLabel>
                                {FIELD_NAMES[field.name as keyof typeof FIELD_NAMES]}
                            </FieldLabel>
                            {field.name === "universityCard" ? 
                            <ImageUpload 
                                onUpload={(url) => {
                                    field.onChange(url);
                                }}
                            /> :
                            <Input
                                {...field}
                                required
                                type={
                                    FIELD_TYPES[field.name as keyof typeof FIELD_TYPES]
                                }
                                className="form-input"
                                autoComplete="off"
                            />
                            }
                        </Field>
                    )}
                    />
                </FieldGroup>
            ))}

            <Button 
                type="submit" 
                className="form-btn font-bold"
                style={{ fontSize: "16px"}}
            >
                {isSignIn ? 'Sign In' : 'Sign Up'}
            </Button>
        </form>
      </CardContent>


    <p className="text-center text-base font-medium">
        {isSignIn ? 'New to BookWise?' : 'Already have an account?'}&nbsp;

        <Link 
            href={isSignIn ? '/sign-up' : '/sign-in'}
            className="font-bold text-primary"
        >
           {isSignIn ? 'Create an account' : 'Sign in'}
        </Link>
    </p>
    </div>
  )
}

export default AuthForm
