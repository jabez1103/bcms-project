"use client";
import { Rnd } from "react-rnd";
import { useEffect, useState } from "react";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Track position in state to force centering
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 1. Handle Escape Key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // 2. Handle Resizing & Centering
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });

      const modalW = Math.min(400, width * 0.8);
      const modalH = 650; // Using minHeight as the reference for centering

      setPosition({
        x: width / 2 - modalW / 2,
        y: height / 2 - modalH / 2,
      });
    };

    handleResize();

    // Add listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [onClose]);

  if (!windowSize) return null;

  return (
    <>
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <Rnd
        size={{ width: Math.min(400, windowSize.width * 0.8), height: 500 }}
        position={position}
        onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
        onResizeStop={(e, direction, ref, delta, position) => {
          setPosition(position);
        }}
        bounds="window"
        minWidth={300}
        minHeight={400}
        dragHandleClassName="handle"
        style={{ zIndex: 50, position: "fixed" }}
      >
        <div className="bg-white border rounded-xl shadow-2xl w-full h-full flex flex-col overflow-hidden border-gray-200">
          {/* Drag handle */}
          <div className="handle bg-gray-50 border-b px-4 py-3 flex justify-between items-center cursor-move select-none">
            <span className="font-semibold text-gray-800 text-sm lg:text-base">
              Settings
            </span>
            <button
              onClick={onClose}
              className="text-xs lg:text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded transition-colors text-gray-700"
            >
              Close
            </button>
          </div>

          {/* Modal content */}
          <div className="p-6 flex-1 overflow-auto text-gray-700">
            <h3 className="text-lg font-medium mb-2">User Preferences</h3>
            <p className="text-sm text-gray-500">
              Basta Settings ni siya, wala pa koy gibutang diri kay wala pa koy
              nahuna-hunaan nga settings nga i-add. Pero pwede nimo i-close ang
              modal by clicking the close button or pressing Escape key.
            </p>
            {/* Additional settings can go here */}
          </div>
        </div>
      </Rnd>
    </>
  );
}
