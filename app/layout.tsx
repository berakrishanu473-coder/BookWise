import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from 'next/font/local'
import { Toaster } from "@/components/ui/toast";
import { SessionProvider } from 'next-auth/react'
import { auth } from "@/auth";

const ibmPlexSans = localFont({
  src: [
    { path: '/fonts/IBMPlexSans-Regular.ttf', weight: '400', style: 'normal'},
    { path: '/fonts/IBMPlexSans-Medium.ttf', weight: '500', style: 'normal'},
    { path: '/fonts/IBMPlexSans-SemiBold.ttf', weight: '600', style: 'normal'},
    { path: '/fonts/IBMPlexSans-Bold.ttf', weight: '700', style: 'normal'},
  ]
});

const bebasNeue = localFont({
  src: [
    { path: '/fonts/BebasNeue-Regular.ttf', weight: '400', style: 'normal'},
  ],
  variable: '--bebas-neue',
});

export const metadata: Metadata = {
  title: "BookWise",
  description: "BookWise is a book borrowing university library management solution",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {

  const session = await auth();

  return (
    <html
      lang="en"
      className={`${ibmPlexSans.className} ${bebasNeue.variable} h-full antialiased`}
    >
      <SessionProvider session={session}>
        <body className="min-h-full flex flex-col">
          {children}
          <Toaster />
        </body>
      </SessionProvider>
    </html>
  );
}
