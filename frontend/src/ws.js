// frontend/src/ws.js
let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT = 6;
const BASE_DELAY_MS = 500;

const WS_URL = 
  import.meta.env.VITE_WS_URL?.trim() ||
  `ws://${window.location.hostname || 'localhost'}:8001/ws`;

console.log("🔌 WS_URL =", WS_URL);

let heartbeatTimer = null;
let heartbeatTimeoutTimer = null;

const HEARTBEAT_INTERVAL_MS = 5000;
const HEARTBEAT_GRACE_MS = 2500;

const listeners = {
  open: new Set(),
  message: new Set(),
  close: new Set(),
  error: new Set(),
};

function notify(type, payload) {
  listeners[type].forEach(fn => {
    try {
      fn(payload);
    } catch (err) {
      console.error(`[ws] listener error (${type}):`, err);
    }
  });
}

function startHeartbeat() {
  stopHeartbeat();

  heartbeatTimer = setInterval(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const ts = Date.now();
    socket.send(JSON.stringify({ type: "ping", ts }));

    clearTimeout(heartbeatTimeoutTimer);
    heartbeatTimeoutTimer = setTimeout(() => {
      console.warn("[ws] ⚠️ heartbeat timeout - reconnecting");
      try {
        socket.close(4000, "heartbeat-timeout");
      } catch {}
    }, HEARTBEAT_GRACE_MS);
  }, HEARTBEAT_INTERVAL_MS);
}

function stopHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
  if (heartbeatTimeoutTimer) clearTimeout(heartbeatTimeoutTimer);
  heartbeatTimeoutTimer = null;
}

function connect() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket;
  }

  console.log("[ws] 🔄 connecting...");
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("[ws] ✅ connected");
    reconnectAttempts = 0;
    startHeartbeat();
    notify("open", null);
  };

  socket.onmessage = (e) => {
    console.log("[ws] 📩 message:", e.data);
    try {
      const msg = JSON.parse(e.data);
      if (msg.type === "pong") {
        if (heartbeatTimeoutTimer) clearTimeout(heartbeatTimeoutTimer);
        console.log("[ws] 💓 pong received");
      } else {
        notify("message", msg);
      }
    } catch (err) {
      console.error("[ws] ❌ parse error:", err);
      notify("message", { type: "text", data: e.data });
    }
  };

  socket.onclose = (event) => {
    console.log("[ws] ❌ closed", event.code, event.reason);
    stopHeartbeat();
    notify("close", { code: event.code, reason: event.reason });
    
    if (reconnectAttempts < MAX_RECONNECT) {
      const delay = Math.min(4000, BASE_DELAY_MS * Math.pow(2, reconnectAttempts));
      console.log(`[ws] 🔄 reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT})`);
      reconnectAttempts++;
      setTimeout(connect, delay);
    } else {
      console.error("[ws] ⛔ max reconnect attempts reached");
    }
  };

  socket.onerror = (err) => {
    console.error("[ws] ⚠️ error:", err);
    notify("error", err);
  };

  return socket;
}

export function getWS() {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    connect();
  }
  return socket;
}

export function onWS(event, handler) {
  if (!listeners[event]) {
    console.error(`[ws] ❌ invalid event: ${event}`);
    return () => {};
  }
  
  listeners[event].add(handler);
  
  // اگر الان connected هست، فوراً handler رو صدا بزن
  if (event === "open" && socket && socket.readyState === WebSocket.OPEN) {
    try {
      handler(null);
    } catch (err) {
      console.error("[ws] handler error:", err);
    }
  }
  
  return () => listeners[event].delete(handler);
}

export function connectWS() {
  return connect();
}

export function sendWS(data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
    return true;
  }
  console.warn("[ws] ⚠️ cannot send - not connected");
  return false;
}

export function shutdownWS() {
  stopHeartbeat();
  if (socket) {
    try {
      socket.close(1000, "app-unmount");
    } catch {}
  }
  socket = null;
}