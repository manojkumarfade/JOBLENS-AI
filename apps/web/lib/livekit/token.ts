import { AccessToken } from "livekit-server-sdk";

export async function mintLiveKitToken(input: {
  apiKey: string;
  apiSecret: string;
  roomName: string;
  identity: string;
  name?: string;
  ttlSeconds?: number;
}) {
  const token = new AccessToken(input.apiKey, input.apiSecret, {
    identity: input.identity,
    name: input.name ?? "JobLens user",
    ttl: input.ttlSeconds ?? 600
  });

  token.addGrant({
    room: input.roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true
  });

  return token.toJwt();
}
