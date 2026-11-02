"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { savedSchema, type SavedItem } from "@/lib/schema";
import { api } from "@/lib/utils";
import { useApp } from "./providers";
export function useLibrary() {
  const { user, authReady } = useApp();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const current = ++generation.current;
    if (!authReady) return;
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const next = z.array(savedSchema).parse(await api("/api/analyses"));
      if (current === generation.current) setItems(next);
    } catch (e) {
      if (current === generation.current) setError((e as Error).message);
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, [authReady, user]);
  useEffect(() => {
    void reload();
    return () => {
      generation.current++;
    };
  }, [reload]);
  return { items, loading, error, reload, setItems, user, authReady };
}
