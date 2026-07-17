// lib/resend.ts — Resend Email Client Placeholder
import { Resend } from 'resend';

let warned = false;
const checkConfig = () => {
  if (!warned) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ WARNING: RESEND_API_KEY is not set. Email sending will fail on execution.');
    }
    warned = true;
  }
};

const rawResend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export const resend = new Proxy(rawResend, {
  get(target, prop, receiver) {
    checkConfig();
    return Reflect.get(target, prop, receiver);
  }
});
