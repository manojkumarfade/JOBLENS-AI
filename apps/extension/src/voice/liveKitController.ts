import type { ExtractedPageContext } from "@joblens/shared";
import { Room, RoomEvent, createLocalAudioTrack } from "livekit-client";
import { apiFetch } from "../apiClient";

let activeRoom: Room | null = null;

export async function startLiveKitSession(input: {
  page: ExtractedPageContext;
  session: {
    token: string;
    livekitUrl: string;
    voiceSessionId: string;
    roomName: string;
    brainModel?: string;
    voiceModel?: string;
  };
  onState: (state: string, message?: string) => void;
}) {
  input.onState("connecting");
  const room = new Room();
  activeRoom = room;

  room.on(RoomEvent.Connected, () => input.onState("listening", input.session.brainModel));
  room.on(RoomEvent.TrackSubscribed, () => input.onState("speaking", input.session.voiceModel));
  room.on(RoomEvent.Disconnected, () => input.onState("ended"));

  try {
    await room.connect(input.session.livekitUrl, input.session.token);
    const micTrack = await createLocalAudioTrack();
    await room.localParticipant.publishTrack(micTrack);
  } catch (error) {
    input.onState("error", error instanceof Error ? error.message : "LiveKit connection failed.");
    await room.disconnect();
    activeRoom = null;
  }
}

export async function endLiveKitSession(voiceSessionId?: string) {
  if (voiceSessionId) {
    await apiFetch("/api/livekit/end-session", {
      method: "POST",
      body: JSON.stringify({ voiceSessionId, reason: "user_ended" })
    }).catch(() => null);
  }
  await activeRoom?.disconnect();
  activeRoom = null;
}
