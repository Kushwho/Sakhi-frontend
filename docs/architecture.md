# Sakhi Voice Agent: Architecture Overview

This document describes the architecture of the Sakhi MVP voice agent, focusing on how the frontend and backend interact via LiveKit.

## Core Components

1.  **Frontend (Next.js)**: Handles the UI, microphone/speaker access, and 3D avatar rendering.
2.  **Backend (FastAPI + LiveKit Agents)**:
    *   **FastAPI**: Serves the `POST /api/token` endpoint to authenticate children and generate LiveKit room tokens.
    *   **LiveKit Agent Server**: The actual Python process that connects to the LiveKit room, listens to the child's audio, processes it through the AI pipeline, and speaks back.
3.  **LiveKit Cloud**: The WebRTC infrastructure that routes realtime audio, video, and data (RPC) between the frontend and the backend.

## Architecture Diagram

```mermaid
sequenceDiagram
    participant Child as Frontend (Next.js)
    participant API as FastAPI Backend
    participant LiveKit as LiveKit Cloud
    participant Agent as Python Voice Agent

    Note over Child,API: 1. Authentication
    Child->>API: POST /api/token (child_name, age, language)
    API-->>Child: { token, room_name, livekit_url }

    Note over Child,LiveKit: 2. Connect to Room
    Child->>LiveKit: Connect using Token (WebRTC)
    LiveKit->>Agent: Job Dispatched (Room Created)
    Agent->>LiveKit: Agent Connects
    Agent->>LiveKit: Reads child profile from participant metadata

    Note over Child,Agent: 3. Realtime Voice Pipeline (Continuous)
    Child->>LiveKit: User Audio Stream (Mic)
    LiveKit->>Agent: Audio received
    Note right of Agent: STT (Deepgram) -> LLM (Groq) -> TTS (Deepgram)
    Agent->>LiveKit: Agent Audio Stream (Speech)
    LiveKit-->>Child: Audio played through speakers

    Note over Child,Agent: 4. Realtime Data (RPC)
    Agent->>LiveKit: RPC "setAvatarExpression" (e.g. "happy")
    LiveKit-->>Child: rpcMethod invoked on Frontend
    Note left of Child: Triggers 3D Avatar Animation
```

## How the Voice Pipeline Works

The Python agent uses the LiveKit Agents SDK. You do **not** need to manage audio streams manually. The LiveKit React SDK (`@livekit/components-react`) automatically handles capturing the microphone and playing the agent's audio output.

1.  **Speech-to-Text (STT)**: Deepgram (`nova-3`, multilingual).
2.  **Language Model (LLM)**: Groq (`llama-3.1-8b-instant`). The system prompt is personalized using the child's profile (name, age, language) parsed from the connection token metadata.
3.  **Text-to-Speech (TTS)**: Deepgram (`aura-2-asteria-en`, English).
4.  **Voice Activity Detection (VAD)**: Silero VAD (handles knowing when the child starts and stops speaking).
5.  **Turn Detection**: LiveKit `MultilingualModel` (handles conversational turn-taking).

## Frontend Responsibilities

To integrate with the backend, the frontend Next.js application must:
1.  **Fetch a Token**: Call `/api/token` with the child's details before trying to connect to LiveKit.
2.  **Connect to LiveKit**: Use the `<LiveKitRoom>` React component provided by `@livekit/components-react`, passing in the `serverUrl` and `token`.
3.  **Render the Voice UI**: Inside `<LiveKitRoom>`, use `<VoiceAssistantControlBar>` to enable the microphone and `<RoomAudioRenderer>` to automatically play the agent's voice.
4.  **Listen for RPC (Avatar Animations)**: Register a listener for the `setAvatarExpression` RPC method on the local participant. When the agent changes emotions, play the corresponding 3D avatar animation. See `api_contract.md` for payload details.
