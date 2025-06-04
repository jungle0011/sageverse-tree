// src/ExtraFeatures.jsx
import React, { useState, useEffect } from "react";

export default function ExtraFeatures({ session, profile, setProfile, isEditing }) {
  const [publicLink, setPublicLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [shortenedLink, setShortenedLink] = useState(null);

  const userId = session?.user?.id;

  // Generate public link
  useEffect(() => {
    if (userId) {
      const ORIGIN = window.location.origin;
      const fullLink = `${ORIGIN}/u/${userId}`;
      setPublicLink(fullLink);

      if (!isEditing) {
        shortenWithTinyURL(fullLink);
      }
    }
  }, [userId, isEditing]);

  // Copy to clipboard
  const copyLinkToClipboard = async () => {
    const linkToCopy = shortenedLink || publicLink;
    try {
      await navigator.clipboard.writeText(linkToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // Use TinyURL free API to shorten link
  const shortenWithTinyURL = async (url) => {
    try {
      const response = await fetch(`https://api.tinyurl.com/create?format=simple&url=${encodeURIComponent(url)}`);
      const text = await response.text();

      if (text.startsWith("http")) {
        setShortenedLink(text);
      } else {
        setShortenedLink(null); // Fallback to publicLink
      }
    } catch (err) {
      console.error("Shortening failed", err);
      setShortenedLink(null); // Fallback to publicLink
    }
  };

  return (
    <div style={{ marginTop: isEditing ? 24 : 0 }}>
      {/* ─── Copy My Link Button ─── */}
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
          <code style={{ color: "#333" }}>{shortenedLink || publicLink}</code>
        </p>
      </div>
    </div>
  );
}