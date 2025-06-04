// src/PublicProfile.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";

export default function PublicProfile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch profile (name, bio, avatar_url)
        let { data: prof, error: profError } = await supabase
          .from("profiles")
          .select("name,bio,avatar_url")
          .eq("id", userId)
          .single();

        if (profError) throw profError;
        setProfile(prof);

        // 2. Fetch links for this user
        let { data: fetchedLinks, error: linksError } = await supabase
          .from("links")
          .select("title,url")
          .eq("user_id", userId)
          .order("position", { ascending: true });

        if (linksError) throw linksError;
        setLinks(fetchedLinks);
      } catch (err) {
        console.error(err);
        setError("Could not load profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div
        style={{
          fontFamily:
            "'Inter', sans-serif",
          textAlign: "center",
          marginTop: 80,
        }}
      >
        <p>Loading user’s page…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div
        style={{
          fontFamily:
            "'Inter', sans-serif",
          textAlign: "center",
          marginTop: 80,
          color: "#a00",
        }}
      >
        <p>{error || "User not found."}</p>
        <Link to="/" style={{ color: "#764ba2", textDecoration: "none" }}>
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <main
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        padding: "40px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      aria-label="Public Link Tree"
    >
      <section
        style={{
          backgroundColor: "#fff",
          borderRadius: 24,
          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
          maxWidth: 400,
          width: "100%",
          padding: 30,
          textAlign: "center",
        }}
      >
        {/* Avatar if exists */}
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt={`${profile.name} avatar`}
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid #764ba2",
              marginBottom: 16,
              boxShadow: "0 4px 12px rgba(118, 75, 162, 0.6)",
            }}
          />
        )}

        {/* Name */}
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 700,
            color: "#333",
            userSelect: "none",
          }}
        >
          {profile.name}
        </h1>

        {/* Bio */}
        <p
          style={{
            marginTop: 8,
            color: "#666",
            fontSize: 14,
            fontStyle: "italic",
            userSelect: "none",
          }}
        >
          {profile.bio}
        </p>

        {/* Links */}
        <nav
          aria-label="User links"
          style={{ marginTop: 24, display: "grid", gap: 12 }}
        >
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "12px 0",
                fontSize: 16,
                fontWeight: 600,
                color: "#fff",
                background: "linear-gradient(90deg, #764ba2, #667eea)",
                borderRadius: 12,
                boxShadow: "0 6px 16px rgba(102, 126, 234, 0.6)",
                textDecoration: "none",
                transition: "background 0.3s ease, transform 0.15s ease",
                userSelect: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(90deg, #5a3782, #475db1)";
                e.currentTarget.style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(90deg, #764ba2, #667eea)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {link.title}
            </a>
          ))}
        </nav>

        {/* CTA Ad to join Sageverse Tree */}
        <div
          style={{
            marginTop: 32,
            padding: 16,
            borderRadius: 12,
            backgroundColor: "#f0f4ff",
            border: "2px solid #667eea",
          }}
        >
          <p style={{ margin: 0, color: "#333", fontSize: 14 }}>
            Want your own Link Tree?{" "}
            <Link
              to="/"
              style={{
                color: "#764ba2",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Join Sageverse Tree for free →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
