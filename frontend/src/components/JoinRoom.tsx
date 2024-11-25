import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";

type JoinRoomProps = {
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  errorMsg: string;
};

export default function JoinRoom({
  onCreateRoom,
  onJoinRoom,
  errorMsg,
}: JoinRoomProps) {
  const [roomId, setRoomId] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to ChatRoom
          </h1>
          <p className="mt-2 text-gray-600">
            Create or join a room to start chatting
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={onCreateRoom}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            <Plus size={20} />
            Create New Room
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or join existing
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="roomId"
                className="block text-sm font-medium text-gray-700"
              >
                Room ID
              </label>
              <input
                type="text"
                id="roomId"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <button
              disabled={!roomId}
              onClick={() => onJoinRoom(roomId)}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-indigo-600 text-indigo-600 py-3 px-4 rounded-lg hover:bg-indigo-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight size={20} />
              Join Room
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <p className="text-red-600 text-sm text-center">{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
}
