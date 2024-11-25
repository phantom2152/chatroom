import { useState } from "react";
import { Send, UserCheck, UserX } from "lucide-react";
import type { Message } from "../types";

type ChatRoomProps = {
  messages: Message[];
  username: string;
  onSendMessage: (message: string) => void;
  peerUsername: string;
  isPeerDisconnected: boolean;
};

export default function ChatRoom({
  messages,
  username,
  onSendMessage,
  peerUsername,
  isPeerDisconnected,
}: ChatRoomProps) {
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Chat Room</h2>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              {isPeerDisconnected ? (
                <UserX size={16} className="text-red-500" />
              ) : (
                <UserCheck size={16} className="text-green-500" />
              )}
              {peerUsername}
            </div>
          </div>
          <div className="text-sm text-gray-500">You: {username}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.username === username ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.username === username
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200"
              }`}
            >
              <p className="break-words">{msg.text}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.username === username
                    ? "text-indigo-200"
                    : "text-gray-500"
                }`}
              >
                {msg.username} • {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
