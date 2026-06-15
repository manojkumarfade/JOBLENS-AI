export function liveKitRoomName(userId: string, sessionId: string) {
  return `joblens-${userId.slice(0, 8)}-${sessionId}`;
}
