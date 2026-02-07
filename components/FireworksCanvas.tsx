"use client";

import React, { useRef } from "react";
import { Fireworks } from "@fireworks-js/react";
import type { FireworksHandlers } from "@fireworks-js/react";

const FireworksCanvas: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const fireworksRef = useRef<FireworksHandlers>(null);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10000 overflow-hidden">
      <Fireworks
        ref={fireworksRef}
        options={{
          opacity: 0.7,
          particles: 200,
          explosion: 7,
          intensity: 70,
          friction: 0.97,
          gravity: 1.5,
          traceLength: 3,
          traceSpeed: 10,
          rocketsPoint: {
            min: 50,
            max: 50,
          },
          lineWidth: {
            explosion: {
              min: 1,
              max: 3,
            },
            trace: {
              min: 1,
              max: 2,
            },
          },
          brightness: {
            min: 50,
            max: 80,
          },
          decay: {
            min: 0.015,
            max: 0.03,
          },
          mouse: {
            click: false,
            move: false,
            max: 1,
          },
        }}
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          position: "absolute",
        }}
      />
    </div>
  );
};

export default FireworksCanvas;
