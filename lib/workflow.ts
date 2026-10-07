import emailjs from '@emailjs/nodejs';
import config from './config';
import {  Client as WorkflowClient } from "@upstash/workflow";

export const workflowClient = new WorkflowClient({
    baseUrl: config.env.upstash.qstashUrl,
    token: config.env.upstash.qstashToken,
});

type SendEmailParams = {
  email: string;
  name: string;
};

export const sendEmail = async ({
  email,
  name
}: SendEmailParams) => {
  try {
    const response = await emailjs.send(
      config.env.emailjs.serviceId,
      config.env.emailjs.templateId,
      {
        to_email: email,
        name
      },
      {
        publicKey: config.env.emailjs.publicKey,
        privateKey: config.env.emailjs.privateKey,
      }
    );

    console.log('Email sent successfully:', response.status);

    return response;
  } catch (error) {
    console.error('EmailJS error:', error);
    throw error;
  }
};