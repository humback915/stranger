"use server";

import { createClient } from "@/lib/supabase/server";
import { toE164 } from "@/lib/validations/auth";

export async function sendOtp(phone: string) {
  const supabase = createClient();
  const e164Phone = toE164(phone);

  const { error } = await supabase.auth.signInWithOtp({
    phone: e164Phone,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function verifyOtp(phone: string, token: string) {
  const supabase = createClient();
  const e164Phone = toE164(phone);

  const { data, error } = await supabase.auth.verifyOtp({
    phone: e164Phone,
    token,
    type: "sms",
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, user: data.user };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
