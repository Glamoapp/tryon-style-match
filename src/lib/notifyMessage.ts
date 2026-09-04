import { supabase } from "@/integrations/supabase/client";

/**
 * Fire-and-forget alert (email + SMS + in-app) to the recipient of a message.
 */
export const notifyNewMessage = (messageId: string) => {
  supabase.functions
    .invoke("notify-new-message", { body: { message_id: messageId } })
    .catch((err) => console.error("notify-new-message failed", err));
};
