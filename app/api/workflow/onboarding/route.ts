import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { serve } from "@upstash/workflow/nextjs"
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/workflow";

type UserState = 'active' | 'non-active';

type InitialData = {
  email: string;
  fullName: string
}

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_IN_MS = 3 * ONE_DAY_IN_MS;
const THIRTY_DAYS_IN_MS = 30 * ONE_DAY_IN_MS;

const getUserState = async(email: string): Promise<UserState> => {
  const user = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

  if(user.length === 0) return 'non-active';

  const lastActivityDate = new Date(user[0].lastActivityDate!);
  const now = new Date();
  const timeDiff = now.getTime() - lastActivityDate.getTime();

  if(timeDiff > THREE_DAYS_IN_MS && timeDiff <= THIRTY_DAYS_IN_MS) {
    return 'non-active';
  }

  return 'active';
}

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload;

  // welcome email
  await context.run("new-signup", async () => {
    await sendEmail({
      email,
      subject: 'Welcome to the BookWise',
      message: `Welcome ${fullName}`
    })
  })

  await context.sleep("wait-for-3-days", THREE_DAYS_IN_MS);

  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email)
    })

    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        await sendEmail({
          email,
          subject: 'Are you still there?',
          message: `Hey ${fullName}, we miss you`,
        })
      })
    } else if (state === "active") {
      await context.run("send-email-active", async () => {
        await sendEmail({
          email,
          subject: "Welcome Back!",
          message: `Welcome back ${fullName}`
        })
      })
    }

    await context.sleep("wait-for-1-month", THIRTY_DAYS_IN_MS)
  }
});