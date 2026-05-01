"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { type Player, type MultiplayerStatus, type MultiplayerRoom, MOCK_BOT_NAMES } from "@/lib/multiplayer";
import { toast } from "sonner";

interface MultiplayerContextType {
  room: MultiplayerRoom | null;
  status: MultiplayerStatus;
  searchForMatch: () => void;
  leaveRoom: () => void;
  updateProgress: (progress: number, wpm: number, accuracy: number) => void;
  startRace: () => void;
}

const MultiplayerContext = createContext<MultiplayerContextType | null>(null);

export function MultiplayerProvider({ children }: { children: React.ReactNode }) {
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [status, setStatus] = useState<MultiplayerStatus>("idle");
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const leaveRoom = useCallback(() => {
    setRoom(null);
    setStatus("idle");
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  const searchForMatch = useCallback(() => {
    setStatus("searching");
    
    // Mock matchmaking delay
    setTimeout(() => {
      const myId = "me_" + Math.random().toString(36).substr(2, 9);
      const newRoom: MultiplayerRoom = {
        id: "room_" + Math.random().toString(36).substr(2, 9),
        players: [
          { id: myId, name: "You", wpm: 0, accuracy: 0, progress: 0, isHost: true, isMe: true }
        ],
        status: "waiting",
      };
      setRoom(newRoom);
      setStatus("waiting");

      // Simulate other players joining
      setTimeout(() => {
        setRoom((prev: MultiplayerRoom | null) => {
          if (!prev) return null;
          const botCount = Math.floor(Math.random() * 3) + 1;
          const bots: Player[] = Array.from({ length: botCount }).map((_, i) => ({
            id: "bot_" + i,
            name: MOCK_BOT_NAMES[Math.floor(Math.random() * MOCK_BOT_NAMES.length)],
            wpm: 0,
            accuracy: 0,
            progress: 0,
            isHost: false,
            isMe: false,
            isBot: true,
          }));
          return { ...prev, players: [...prev.players, ...bots] };
        });
        toast.success("Opponents joined! Starting soon...");
      }, 2000);
    }, 1500);
  }, []);

  const startRace = useCallback(() => {
    if (!room) return;
    setStatus("starting");
    setRoom((prev: MultiplayerRoom | null) => prev ? { ...prev, countdown: 5 } : null);

    let count = 5;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setStatus("racing");
        setRoom((prev: MultiplayerRoom | null) => prev ? { ...prev, status: "racing", startTime: Date.now(), countdown: 0 } : null);
      } else {
        setRoom((prev: MultiplayerRoom | null) => prev ? { ...prev, countdown: count } : null);
      }
    }, 1000);
  }, [room]);

  const updateProgress = useCallback((progress: number, wpm: number, accuracy: number) => {
    setRoom((prev: MultiplayerRoom | null) => {
      if (!prev) return null;
      const nextPlayers = prev.players.map((p: Player) => 
        p.isMe ? { ...p, progress, wpm, accuracy } : p
      );
      
      // Check if I finished
      const allDone = nextPlayers.every((p: Player) => p.progress >= 1);
      if (allDone && status !== "finished") {
        setStatus("finished");
      }

      return { ...prev, players: nextPlayers };
    });
  }, [status]);

  // Simulate bot progress
  useEffect(() => {
    if (status !== "racing" || !room) return;

    const botInterval = setInterval(() => {
      setRoom((prev: MultiplayerRoom | null) => {
        if (!prev) return null;
        let anyChanges = false;
        const nextPlayers = prev.players.map((p: Player) => {
          if (p.isBot && p.progress < 1) {
            anyChanges = true;
            const newProgress = Math.min(1, p.progress + (Math.random() * 0.05));
            const newWpm = Math.floor(40 + Math.random() * 60);
            return { ...p, progress: newProgress, wpm: newWpm, accuracy: 95 + Math.random() * 5 };
          }
          return p;
        });
        
        if (!anyChanges) {
           clearInterval(botInterval);
           setStatus("finished");
           return { ...prev, players: nextPlayers, status: "finished" };
        }

        return { ...prev, players: nextPlayers };
      });
    }, 1000);

    return () => clearInterval(botInterval);
  }, [status, room]);

  return (
    <MultiplayerContext.Provider value={{ room, status, searchForMatch, leaveRoom, updateProgress, startRace }}>
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayer() {
  const context = useContext(MultiplayerContext);
  if (!context) throw new Error("useMultiplayer must be used within MultiplayerProvider");
  return context;
}
