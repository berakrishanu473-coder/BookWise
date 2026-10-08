import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { serve } from "@upstash/workflow/nextjs";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/workflow";
import config from "@/lib/config";

type InitialData = {
  email: string;
  fullName: string;
};

const ONE_DAY = 60 * 60 * 24;
const THREE_DAYS = ONE_DAY * 3;
const THIRTY_DAYS = ONE_DAY * 30;

const getLastActivity = async (email: string) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user[0] || !user[0].lastActivityDate) {
    return null;
  }

  return new Date(user[0].lastActivityDate).getTime();
};

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload;

  // 1. Send signup welcome email
  await context.run("new-signup", async () => {
    await sendEmail({
      email,
      name: fullName,
      templateId: config.env.emailjs.templateId,
    });
  });

  // 2. Wait 3 days after signup
  await context.sleep(
    "wait-for-3-days",
    THREE_DAYS
  );

  // 3. Monthly cycle starts here
  while (true) {

    // Check user's latest activity
    const lastActivity = await context.run(
      "check-user-activity",
      async () => {
        return await getLastActivity(email);
      }
    );

    if (!lastActivity) {
      return;
    }

    const inactiveFor = Date.now() - lastActivity;

    // USER IS ACTIVE
    if (inactiveFor <= THREE_DAYS) {

      // User is active, so don't send anything.
      // Wait 30 days before checking again.
      await context.sleep(
        "wait-for-next-month",
        THIRTY_DAYS
      );

      continue;
    }

    // USER IS INACTIVE
    await context.run(
      "send-email-non-active",
      async () => {
        await sendEmail({
          email,
          name: fullName,
          subject: `We miss you at BookWise, ${fullName}!!`,
          message:
            "It's been a little while since we've seen you. Come back and explore your university library!",
          templateId:
            config.env.emailjs.inactiveTemplateId,
        });
      }
    );

    // Remember the activity that existed
    // when we detected inactivity.
    const inactiveActivity = lastActivity;

    // Check for return every day for 30 days
    let userReturned = false;

    for (let day = 1; day <= 30; day++) {

      await context.sleep(
        `wait-for-return-day-${day}`,
        ONE_DAY
      );

      const latestActivity = await context.run(
        `check-return-activity-${day}`,
        async () => {
          return await getLastActivity(email);
        }
      );

      if (!latestActivity) {
        continue;
      }

      // User returned after becoming inactive
      if (latestActivity > inactiveActivity) {

        await context.run(
          "send-email-welcome-back",
          async () => {
            await sendEmail({
              email,
              name: fullName,
              subject: `Welcome back to BookWise, ${fullName}!!`,
              message:
                "We're happy to see you again. Explore books and make the most of your university library!",
              templateId:
                config.env.emailjs.inactiveTemplateId,
            });
          }
        );

        userReturned = true;
        break;
      }
    }

    // After return OR 30 days of no return,
    // start the next monthly cycle.
    if (userReturned) {
      await context.sleep(
        "wait-for-next-month",
        THIRTY_DAYS
      );
    }

    // If user didn't return for 30 days,
    // while(true) automatically starts another cycle.
  }
});