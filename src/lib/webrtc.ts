import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type SignalMessage =
  | { kind: "offer"; from: string; to: string; sdp: RTCSessionDescriptionInit }
  | { kind: "answer"; from: string; to: string; sdp: RTCSessionDescriptionInit }
  | { kind: "candidate"; from: string; to: string; candidate: RTCIceCandidateInit };

export type RoomConnectionCallbacks = {
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onPeerJoined?: () => void;
  onPeerLeft?: () => void;
  onCountdown?: (secondsLeft: number) => void;
  onCaptureTrigger?: () => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
};

function buildIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
  const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME;
  const turnCredential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;

  if (turnUrl && turnUsername && turnCredential) {
    servers.push({ urls: turnUrl, username: turnUsername, credential: turnCredential });
  }

  return servers;
}

// Manages one couple's session: presence, WebRTC signaling over Supabase
// Realtime broadcast, and synced countdown/capture events.
export class RoomConnection {
  readonly clientId = crypto.randomUUID();
  private channel: RealtimeChannel | null = null;
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remotePeerId: string | null = null;
  private negotiationStarted = false;

  constructor(
    private roomId: string,
    private callbacks: RoomConnectionCallbacks = {}
  ) {}

  async join() {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.callbacks.onLocalStream?.(this.localStream);

    this.channel = supabase.channel(`room:${this.roomId}`, {
      config: { presence: { key: this.clientId } },
    });

    this.channel
      .on("broadcast", { event: "signal" }, ({ payload }) => this.handleSignal(payload as SignalMessage))
      .on("broadcast", { event: "countdown" }, ({ payload }) => {
        this.callbacks.onCountdown?.((payload as { secondsLeft: number }).secondsLeft);
      })
      .on("broadcast", { event: "capture" }, () => this.callbacks.onCaptureTrigger?.())
      .on("presence", { event: "sync" }, () => this.handlePresenceSync())
      .on("presence", { event: "leave" }, () => {
        this.remotePeerId = null;
        this.callbacks.onPeerLeft?.();
      });

    await this.channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await this.channel!.track({ joinedAt: Date.now() });
      }
    });
  }

  // The peer with the lexicographically smaller id initiates the offer.
  // Deterministic, so both sides agree without a race.
  private handlePresenceSync() {
    const state = this.channel!.presenceState();
    const peerIds = Object.keys(state).filter((id) => id !== this.clientId);
    if (peerIds.length === 0) return;

    const otherId = peerIds[0];
    if (this.remotePeerId === otherId) return;

    this.remotePeerId = otherId;
    this.callbacks.onPeerJoined?.();

    if (!this.negotiationStarted && this.clientId < otherId) {
      this.negotiationStarted = true;
      this.startNegotiation(otherId);
    }
  }

  private ensurePeerConnection(): RTCPeerConnection {
    if (this.pc) return this.pc;

    const pc = new RTCPeerConnection({ iceServers: buildIceServers() });

    this.localStream!.getTracks().forEach((track) => pc.addTrack(track, this.localStream!));

    pc.ontrack = (event) => this.callbacks.onRemoteStream?.(event.streams[0]);
    pc.onconnectionstatechange = () => this.callbacks.onConnectionStateChange?.(pc.connectionState);
    pc.onicecandidate = (event) => {
      if (event.candidate && this.remotePeerId) {
        this.send({
          kind: "candidate",
          from: this.clientId,
          to: this.remotePeerId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    this.pc = pc;
    return pc;
  }

  private async startNegotiation(otherId: string) {
    const pc = this.ensurePeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.send({ kind: "offer", from: this.clientId, to: otherId, sdp: offer });
  }

  private async handleSignal(message: SignalMessage) {
    if (message.to !== this.clientId) return;
    const pc = this.ensurePeerConnection();

    if (message.kind === "offer") {
      this.remotePeerId = message.from;
      await pc.setRemoteDescription(message.sdp);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.send({ kind: "answer", from: this.clientId, to: message.from, sdp: answer });
    } else if (message.kind === "answer") {
      await pc.setRemoteDescription(message.sdp);
    } else if (message.kind === "candidate") {
      await pc.addIceCandidate(message.candidate);
    }
  }

  private send(message: SignalMessage) {
    this.channel?.send({ type: "broadcast", event: "signal", payload: message });
  }

  // Either side can trigger the synced countdown; both peers receive the
  // same "capture" event and snapshot their own video at the same instant.
  broadcastCountdown(seconds: number) {
    let secondsLeft = seconds;
    this.channel?.send({ type: "broadcast", event: "countdown", payload: { secondsLeft } });
    this.callbacks.onCountdown?.(secondsLeft);

    const interval = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        clearInterval(interval);
        this.channel?.send({ type: "broadcast", event: "capture" });
        this.callbacks.onCaptureTrigger?.();
        return;
      }
      this.channel?.send({ type: "broadcast", event: "countdown", payload: { secondsLeft } });
      this.callbacks.onCountdown?.(secondsLeft);
    }, 1000);
  }

  leave() {
    this.channel?.unsubscribe();
    this.pc?.close();
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.channel = null;
    this.pc = null;
    this.localStream = null;
  }
}
