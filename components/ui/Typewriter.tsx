"use client";

import { useState, useEffect } from "react";

interface TypewriterProps {
  text: string | string[];
  speed?: number;
  delay?: number;
  pause?: number;
  infinite?: boolean;
  className?: string;
  cursorClassName?: string;
}

export default function Typewriter({
  text,
  speed = 100,
  delay = 0,
  pause = 3000,
  infinite = true,
  className = "",
  cursorClassName = "bg-brand-500",
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const texts = Array.isArray(text) ? text : [text];

  useEffect(() => {
    const startTimeout = setTimeout(() => setHasStarted(true), delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    const currentFullText = texts[textIndex];
    
  const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentIndex < currentFullText.length) {
          setDisplayText(currentFullText.slice(0, currentIndex + 1));
          setCurrentIndex((prev) => prev + 1);
        } else {
          // Finished typing
          if (infinite || textIndex < texts.length - 1) {
            setTimeout(() => setIsDeleting(true), pause);
          }
        }
      } else {
        // Deleting
        if (currentIndex > 0) {
          setDisplayText(currentFullText.slice(0, currentIndex - 1));
          setCurrentIndex((prev) => prev - 1);
        } else {
          // Finished deleting
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
          setCurrentIndex(0);
        }
      }
    }, isDeleting ? speed / 2 : speed + Math.random() * 50);

    return () => clearTimeout(timeout);
  }, [currentIndex, isDeleting, textIndex, texts, speed, pause, infinite, hasStarted]);

  return (
    <span className={className}>
      {displayText}
      <span
        className={`inline-block w-[2px] h-[0.8em] ml-1 align-middle animate-pulse ${cursorClassName}`}
      />
    </span>
  );
}
