"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const isSecureContext = window.location.protocol === "https:" || window.location.hostname === "localhost";
    if (!isSecureContext) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.info("[pwa] service worker registered", { scope: registration.scope });
      })
      .catch((error) => {
        console.error("[pwa] service worker registration failed", error);
      });
  }, []);

  return null;
}
