import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { Message, ReadyUpdate, RoomStatus } from "./types";
import JoinRoom from "./components/JoinRoom";
import WaitingForJoin from "./components/WaitingForJoin";
import WaitingRoom from "./components/WaitingRoom";
import ChatRoom from "./components/ChatRoom";
import ClosedRoom from "./components/ClosedRoom";

// Initialize socket with error handling
const socket = io("http://localhost:5001", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default function App() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [roomStatus, setRoomStatus] = useState("");
  const [peerUsername, setPeerUsername] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPeerReady, setIsPeerReady] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPeerDisconnected, setIsPeerDisconnected] = useState(false);

  useEffect(() => {
    // Socket connection error handling
    const handleConnectError = (error: Error) => {
      console.error("Socket connection error:", error);
      handleError("Connection error. Please try again.");
    };

    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect_error", handleConnectError);
    };
  }, []);

  useEffect(() => {
    if (roomId && username) {
      const handleRoomStatus = (data: RoomStatus) => {
        console.log("📥 Room Status Update:", data);
        setRoomStatus(data.status);
        if (data.status === "waiting_for_ready") {
          setPeerUsername(isCreator ? data.users.joiner : data.users.creator);
        }
      };

      const handleReadyUpdate = (data: ReadyUpdate) => {
        console.log("🎮 Ready Status Update:", data);
        if (data.username === username) {
          setIsReady(true);
        } else {
          setIsPeerReady(true);
        }

        if (data.bothReady) {
          setRoomStatus(data.newState);
        }
      };

      const handleReceiveMessage = (data: Message) => {
        console.log("💬 New Message:", data);
        setMessages((prev) => [...prev, data]);
      };

      const handlePeerDisconnect = (data: { username: string }) => {
        console.log("❌ Peer Disconnected:", data);
        setIsPeerDisconnected(true);
        setRoomStatus("closed");
        setPeerUsername("");
        setMessages([]);
      };

      const handleJoinError = (error: { message: string }) => {
        console.error("Join Error:", error);
        handleError(error.message);
        setUsername("");
        setRoomId("");
        setRoomStatus("");
      };

      socket.on("room_status", handleRoomStatus);
      socket.on("ready_update", handleReadyUpdate);
      socket.on("receive_message", handleReceiveMessage);
      socket.on("peer_disconnected", handlePeerDisconnect);
      socket.on("join_error", handleJoinError);

      // Emit join_room event with error handling
      socket.emit(
        "join_room",
        { roomId, username },
        (response: { error?: string }) => {
          if (response?.error) {
            console.error("Join room error:", response.error);
            handleError(response.error);
            setUsername("");
            setRoomId("");
            setRoomStatus("");
          }
        }
      );

      return () => {
        socket.off("room_status", handleRoomStatus);
        socket.off("ready_update", handleReadyUpdate);
        socket.off("receive_message", handleReceiveMessage);
        socket.off("peer_disconnected", handlePeerDisconnect);
        socket.off("join_error", handleJoinError);
      };
    }
  }, [username, roomId, isCreator]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (roomId && username) {
        socket.emit("user_leaving", { roomId, username });
      }
    };

    const handlePopState = () => {
      if (roomId && username) {
        socket.emit("user_leaving", { roomId, username });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [roomId, username]);

  const handleError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 5000);
  };

  const handleCreateRoom = async () => {
    try {
      const res = await fetch("http://localhost:5001/createroom", {
        method: "POST",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create room");
      }

      const data = await res.json();
      setUsername(data.creator_username);
      setRoomId(data.id);
      setIsCreator(true);
      setRoomStatus("waiting_for_join");

      // No need to emit join_room here as it's handled in the useEffect
    } catch (err) {
      console.error("Error creating room:", err);
      handleError(
        err instanceof Error
          ? err.message
          : "Failed to create room. Please try again."
      );
    }
  };

  const handleJoinRoom = async (roomIdToJoin: string) => {
    try {
      const res = await fetch(`http://localhost:5001/join/${roomIdToJoin}`);

      if (res.status === 404) {
        handleError("Room not found");
        return;
      }

      if (res.status === 403) {
        handleError("Room is full or no longer available");
        return;
      }

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `Unexpected status: ${res.status}`);
      }

      const data = await res.json();
      setUsername(data.joiner_username);
      setRoomId(data.id);

      // No need to emit join_room here as it's handled in the useEffect
    } catch (err) {
      console.error("Error joining room:", err);
      handleError(
        err instanceof Error
          ? err.message
          : "Failed to join room. Please try again."
      );
    }
  };

  const handleReady = () => {
    socket.emit("user_ready", { roomId, username });
  };

  const handleSendMessage = (message: string) => {
    socket.emit("chat_message", {
      roomId,
      username,
      text: message,
    });
  };

  const handleLeaveRoom = () => {
    if (roomId && username) {
      socket.emit("user_leaving", { roomId, username });
    }
    setUsername("");
    setRoomId("");
    setRoomStatus("");
    setPeerUsername("");
    setIsCreator(false);
    setIsReady(false);
    setIsPeerReady(false);
    setMessages([]);
    setIsPeerDisconnected(false);
  };

  if (!username) {
    return (
      <JoinRoom
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        errorMsg={errorMsg}
      />
    );
  }

  if (roomStatus === "waiting_for_join") {
    return <WaitingForJoin roomId={roomId} username={username} />;
  }

  if (roomStatus === "waiting_for_ready") {
    return (
      <WaitingRoom
        username={username}
        isCreator={isCreator}
        peerUsername={peerUsername}
        isReady={isReady}
        isPeerReady={isPeerReady}
        onReady={handleReady}
      />
    );
  }

  if (roomStatus === "chat_active") {
    return (
      <ChatRoom
        messages={messages}
        username={username}
        onSendMessage={handleSendMessage}
        peerUsername={peerUsername}
        isPeerDisconnected={isPeerDisconnected}
      />
    );
  }

  if (roomStatus === "closed") {
    return (
      <ClosedRoom
        onLeaveRoom={handleLeaveRoom}
        isPeerDisconnected={isPeerDisconnected}
      />
    );
  }

  return null;
}
