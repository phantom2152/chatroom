import { Copy, Loader2, User } from "lucide-react";

type WaitingForJoinProps = {
  roomId: string;
  username: string;
};

export default function WaitingForJoin({
  roomId,
  username,
}: WaitingForJoinProps) {
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
            <Loader2 size={32} className="text-indigo-600 animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Waiting for Someone to Join
            </h2>
            <p className="text-gray-600">
              Share this room ID with someone to start chatting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <code className="flex-1 text-lg font-mono text-gray-800">
            {roomId}
          </code>
          <button
            onClick={handleCopyRoomId}
            className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
            title="Copy room ID"
          >
            <Copy size={20} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
          <User size={18} />
          <span>
            You are:{" "}
            <span className="font-medium text-gray-900">{username}</span>
          </span>
        </div>

        <p className="text-sm text-gray-500">
          Once someone joins, you'll both need to mark yourselves as ready to
          begin chatting.
        </p>
      </div>
    </div>
  );
}
