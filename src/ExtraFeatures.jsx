import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function ExtraFeatures({ session, profile, setProfile, isEditing }) {
  const [publicLink, setPublicLink] = useState("");
  const [copied, setCopied] = useState(false);

  const userId = session?.user?.id;

  useEffect(() => {
    if (userId) {
      const ORIGIN = window.location.origin;
      setPublicLink(`${ORIGIN}/u/${userId}`);
    }
  }, [userId]);

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div style={{ marginTop: isEditing ? 24 : 0 }}>
      {/* Copy My Link Button */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <button
          onClick={copyLinkToClipboard}
          style={{
            backgroundColor: copied ? "#4caf50" : "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 16px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            boxShadow: "0 4px 12px rgba(0,123,255,0.3)",
            transition: "background-color 0.3s ease",
          }}
        >
          {copied ? "Link Copied!" : "Copy My Link"}
        </button>
        <p style={{ fontSize: 12, color: "#555", marginTop: 8 }}>
          Share this URL so others can view your Link Tree:
          <br />
          <code style={{ color: "#333" }}>{publicLink}</code>
        </p>
      </div>
    </div>
  );
}