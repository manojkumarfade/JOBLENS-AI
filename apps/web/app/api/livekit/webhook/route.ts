import { handleRouteError, json } from "@/lib/api";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const event = (await request.json()) as Record<string, unknown>;
    const room = typeof event.room === "object" && event.room !== null ? (event.room as Record<string, unknown>) : null;
    const roomName =
      (room && typeof room.name === "string" ? room.name : null) ??
      (typeof event.room_name === "string" ? event.room_name : null) ??
      (typeof event.roomName === "string" ? event.roomName : null);
    if (roomName) {
      const status = event.event === "room_finished" ? "ended" : event.event === "room_started" ? "active" : null;
      if (status) {
        const supabase = createSupabaseServiceClient();
        await supabase
          .from("voice_sessions")
          .update({
            status,
            ...(status === "ended" ? { ended_at: new Date().toISOString() } : {}),
            metadata: { livekitEvent: event.event }
          })
          .eq("livekit_room_name", roomName);
      }
    }
    return json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
