import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Video } from "@/lib/types";

type ModalCtx = {
  activeVideo: Video | null;
  focusMode: boolean;
  openModal: (v: Video) => void;
  closeModal: () => void;
  toggleFocusMode: () => void;
};

const Ctx = createContext<ModalCtx | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  const openModal = useCallback((v: Video) => {
    setActiveVideo(v);
    setFocusMode(false);
  }, []);

  const closeModal = useCallback(() => {
    setActiveVideo(null);
    setFocusMode(false);
  }, []);

  const toggleFocusMode = useCallback(() => setFocusMode((f) => !f), []);

  const value = useMemo(
    () => ({ activeVideo, focusMode, openModal, closeModal, toggleFocusMode }),
    [activeVideo, focusMode, openModal, closeModal, toggleFocusMode]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}
