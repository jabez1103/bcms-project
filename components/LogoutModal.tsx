"use client";
import { Rnd } from "react-rnd";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import the router

interface SettingsModalProps {
  onClose: () => void;
}

export function LogoutModal({ onClose }: SettingsModalProps) {
  const router = useRouter(); // Initialize router
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });

      const modalW = Math.min(400, width * 0.8);
      const modalH = 320; // height of modal

      setPosition({
        x: width / 2 - modalW / 2,
        y: height / 2 - modalH / 2,
      });
    };

    handleResize();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [onClose]);

  if (!windowSize) return null;

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    router.push("/");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <Rnd
        size={{ width: Math.min(400, windowSize.width * 0.8), height: 320 }}
        position={position}
        onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
        onResizeStop={(e, direction, ref, delta, position) =>
          setPosition(position)
        }
        bounds="window"
        minWidth={300}
        minHeight={320}
        dragHandleClassName="handle"
        style={{ zIndex: 50, position: "fixed" }}
      >
        <div className="bg-white border rounded-xl shadow-2xl w-full h-full flex flex-col overflow-hidden border-gray-200">
          {/* Handle */}
          <div className="handle bg-gray-50 border-b px-4 py-2 flex text-gray-700 justify-between items-center cursor-move select-none">
            <span className="font-bold text-sm">Confirm Logout</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col justify-between text-gray-700">
            <div className="flex-1 flex items-center justify-center">
              <p className="text-center font-medium">
                Are you sure you want to log out?
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout} // <-- use this
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-shadow shadow-md active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </Rnd>
    </>
  );
}
