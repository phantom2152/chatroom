import { DoorClosed } from "lucide-react";

type ClosedRoomProps = {
  onLeaveRoom: () => void;
  isPeerDisconnected: boolean;
};

export default function ClosedRoom({
  onLeaveRoom,
  isPeerDisconnected,
}: ClosedRoomProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <DoorClosed size={32} className="text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Room Closed</h2>
            <p className="text-gray-600">
              {isPeerDisconnected
                ? "Your peer has disconnected from the room."
                : "This room has been closed."}
            </p>
          </div>
        </div>

        <button
          onClick={onLeaveRoom}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
