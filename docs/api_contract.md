# Sakhi Voice Agent: API Contract

This document outlines the interfaces the frontend must use to communicate with the Sakhi backend and the LiveKit Agent.

## 1. REST API (FastAPI)

The frontend must fetch a LiveKit connection token before starting a voice session.

### `POST /api/token`

Generates a LiveKit JWT token scoped to a specific room, embedding the child's profile into the token's metadata. The agent reads this metadata to personalize its responses.

**Request Body (JSON):**

```json
{
  "child_name": "string (default: 'buddy')",
  "child_age": "integer (default: 8)",
  "child_language": "string (default: 'English')"
}
```

**Response (JSON - 200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...", 
  "room_name": "sakhi-buddy-1715802345", 
  "livekit_url": "wss://your-project.livekit.cloud"
}
```

*Frontend Action:* Pass `token` and `livekit_url` into the `@livekit/components-react` `<LiveKitRoom>` component.

---

### `GET /api/health`

**Response (JSON - 200 OK):**

```json
{
  "status": "ok",
  "service": "sakhi-backend",
  "timestamp": 1715802345.123
}
```

---

## 2. Remote Procedure Calls (RPC)

The Python Voice Agent calls RPC methods on the frontend to trigger UI changes, specifically 3D avatar animations.

### `setAvatarExpression` (Backend -> Frontend)

The agent calls this method on the frontend participant when the avatar's facial expression needs to change to match the conversation.

**Registered via:** `@livekit/components-react` `useLocalParticipant().localParticipant.registerRpcMethod(...)`

**Payload (Stringified JSON):**

The agent sends a stringified JSON object. You must `JSON.parse()` it.

```json
{
  "expression": "string"
}
```

**Supported `expression` values:**
*   `happy`
*   `thinking`
*   `excited`
*   `concerned`
*   `sad`
*   `celebrating`

**Expected Frontend Return:**
The RPC expects a response string to confirm receipt (e.g., `"Expression updated on frontend"`). If the frontend does not respond within 5 seconds, the agent logs a warning but continues speaking.

**Example Frontend Listener (React):**

```tsx
import { useEffect } from "react";
import { useLocalParticipant } from "@livekit/components-react";

export function AvatarController() {
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (!localParticipant) return;
    
    localParticipant.registerRpcMethod("setAvatarExpression", async (data) => {
      // 1. Data payload is a stringified JSON object
      const payload = JSON.parse(data.payload);
      const newExpression = payload.expression;
      
      console.log("Agent requested expression:", newExpression);
      
      // 2. TODO: Trigger your 3D Avatar (Three.js/React Three Fiber) animation here
      // e.g. playAnimation(newExpression)
      
      // 3. Return confirmation
      return "Expression updated";
    });
  }, [localParticipant]);

  return null;
}
```
