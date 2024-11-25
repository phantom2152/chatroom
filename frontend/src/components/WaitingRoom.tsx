import { CheckCircle, Loader2, User } from "lucide-react";

type WaitingRoomProps = {
  username: string;
  isCreator: boolean;
  peerUsername: string;
  isReady: boolean;
  isPeerReady: boolean;
  onReady: () => void;
};

export default function WaitingRoom({
  username,
  isCreator,
  peerUsername,
  isReady,
  isPeerReady,
  onReady,
}: WaitingRoomProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Waiting Room</h2>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <User size={18} />
              <span>
                You are:{" "}
                <span className="font-medium text-gray-900">{username}</span>
              </span>
            </div>
            <p className="text-gray-600">
              {isCreator ? "Joined by:" : "Connected with:"}{" "}
              <span className="font-medium">{peerUsername}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {!isReady ? (
            <button
              onClick={onReady}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              Ready to Chat
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle size={20} />
              <p>You're ready!</p>
            </div>
          )}

          {isPeerReady ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle size={20} />
              <p>Peer is ready!</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 size={20} className="animate-spin" />
              <p>Waiting for peer...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
