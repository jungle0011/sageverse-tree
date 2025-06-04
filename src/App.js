// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import ExtraFeatures from "./ExtraFeatures";
import PublicProfile from "./PublicProfile";


const initialDefaults = {
  name: "Sageverse Tree",
  bio: "Community manager & philanthropist",
  avatar_url: "https://i.pravatar.cc/150?u=sageverse",
  links: [
    { title: "Twitter", url: "https://twitter.com/mrjungle", icon: "🐦" },
    { title: "Discord", url: "https://discord.gg/example", icon: "💬" },
    { title: "Portfolio", url: "https://mrjungle.com", icon: "🌐" },
    { title: "Extra Link 1", url: "https://extra1.com", icon: "🔗" },
    { title: "Extra Link 2", url: "https://extra2.com", icon: "🔗" },
  ],
};


function Dashboard() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    avatar_url: "",
  });
  const [links, setLinks] = useState([]);
  const [editing, setEditing] = useState(false);

  // ─── On mount, check Supabase session ───
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfileAndLinks();
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfileAndLinks();
      } else {
        setLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchProfileAndLinks();
    }
  }, [session]);
  async function fetchProfileAndLinks() {
    if (!session?.user) return; // ✅ Prevent crash if session or user is null
  
    setLoading(true);
    const userId = session.user.id;
  
    // Fetch or initialize profile
    let { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("name,bio,avatar_url")
      .eq("id", userId)
      .single();
  
    if (profileError && profileError.code === "PGRST116") {
      const { data: newProfile } = await supabase.from("profiles").insert({
        id: userId,
        name: initialDefaults.name,
        bio: initialDefaults.bio,
        avatar_url: initialDefaults.avatar_url,
      });
      existingProfile = newProfile[0];
    }
  
    setProfile({
      name: existingProfile.name || "",
      bio: existingProfile.bio || "",
      avatar_url: existingProfile.avatar_url || "",
    });
  
    // Fetch or initialize links
    let { data: existingLinks, error: linksError } = await supabase
      .from("links")
      .select("title,url,position")
      .eq("user_id", userId)
      .order("position", { ascending: true });
  
    if (linksError) {
      console.error(linksError);
      setLinks([]);
    } else if (!existingLinks || existingLinks.length === 0) {
      const defaultLinksToInsert = initialDefaults.links.map((link, idx) => ({
        user_id: userId,
        title: link.title,
        url: link.url,
        position: idx,
      }));
      await supabase.from("links").insert(defaultLinksToInsert);
      setLinks(
        defaultLinksToInsert.map((l, idx) => ({
          title: initialDefaults.links[idx].title,
          url: initialDefaults.links[idx].url,
          position: idx,
          icon: initialDefaults.links[idx].icon,
        }))
      );
    } else {
      setLinks(
        existingLinks.map((l) => {
          const foundDefault = initialDefaults.links.find((d) => d.title === l.title);
          return {
            title: l.title,
            url: l.url,
            position: l.position,
            icon: foundDefault ? foundDefault.icon : "🔗",
          };
        })
      );
    }
  
    setLoading(false);
  }
  async function saveProfile() {
    setLoading(true);
    const userId = session.user.id;
    await supabase
      .from("profiles")
      .update({ name: profile.name, bio: profile.bio, avatar_url: profile.avatar_url })
      .eq("id", userId);
    setEditing(false);
    setLoading(false);
  }

  async function saveLinks() {
    setLoading(true);
    const userId = session.user.id;
    await supabase.from("links").delete().eq("user_id", userId);
    const newLinksToInsert = links.map((link, idx) => ({
      user_id: userId,
      title: link.title,
      url: link.url,
      position: idx,
    }));
    await supabase.from("links").insert(newLinksToInsert);
    setEditing(false);
    fetchProfileAndLinks();
  }

  if (!session || !session.user) {
    return (
      <Auth
        onLogin={() =>
          supabase.auth
            .getSession()
            .then(({ data: { session } }) => setSession(session))
        }
      />
    );
  }

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 50 }}>Loading…</p>;
  }

  return (
    <div>
      {/* ─── Logout Button ─── */}
      <div style={{ textAlign: "right", padding: "10px 20px" }}>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            backgroundColor: "#ff4d4f", 
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>

      {/* ─── Edit Mode ─── */}
      {editing ? (
        <main
          style={{
            fontFamily:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
            background: "linear-gradient(135deg, #f0f4ff 0%, #dbe4ff 100%)",
            minHeight: "100vh",
            padding: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <section
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
              maxWidth: 600,
              width: "100%",
              padding: 24,
            }}
          >
            <h2 style={{ marginBottom: 16 }}>Edit Your Profile</h2>

            {/* ─── Profile Fields ─── */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600 }}>Name:</label>
              <input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 4,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
              />

              <label style={{ fontWeight: 600, marginTop: 12, display: "block" }}>Bio:</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={2}
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 4,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  resize: "vertical",
                }}
              />

              <label style={{ fontWeight: 600, marginTop: 12, display: "block" }}>Avatar URL:</label>
              <input
                value={profile.avatar_url}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 4,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
              />
            </div>

            {/* ─── Links Editor ─── */}
            <div>
              <h3 style={{ marginBottom: 8 }}>Manage Your Links</h3>
              {links.map((link, idx) => (
                <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
                  <input
                    value={link.title}
                    onChange={(e) => {
                      const newLinks = [...links];
                      newLinks[idx].title = e.target.value;
                      setLinks(newLinks);
                    }}
                    placeholder="Link title"
                    style={{
                      flex: 1,
                      padding: 6,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                    }}
                  />
                  <input
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...links];
                      newLinks[idx].url = e.target.value;
                      setLinks(newLinks);
                    }}
                    placeholder="https://example.com" 
                    style={{
                      flex: 2,
                      padding: 6,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                    }}
                  />
                  <button
                    onClick={() => {
                      const newLinks = links.filter((_, i) => i !== idx);
                      setLinks(newLinks);
                    }}
                    style={{
                      backgroundColor: "#ff4d4f",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  setLinks([
                    ...links,
                    {
                      title: "New Link",
                      url: "",
                      icon: "🔗",
                      position: links.length,
                    },
                  ]);
                }}
                style={{
                  marginTop: 8,
                  backgroundColor: "#764ba2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontWeight: 600,
                  width: "100%",
                }}
              >
                + Add New Link
              </button>
            </div>

            {/* ─── Save & Cancel Buttons ─── */}
            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  saveProfile();
                  saveLinks();
                }}
                style={{
                  backgroundColor: "#4caf50",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 20px",
                  cursor: "pointer",
                  fontWeight: 600,
                  flex: 1,
                }}
              >
                Save Profile
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  backgroundColor: "#666",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 20px",
                  cursor: "pointer",
                  fontWeight: 600,
                  flex: 1,
                }}
              >
                Cancel
              </button>
            </div>
          </section>
        </main>
      ) : (
        /* ─── View Mode ─── */
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
            {/* Avatar */}
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={`${profile.name} avatar`}
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid #764ba2",
                  marginBottom: 20,
                  boxShadow: "0 4px 12px rgba(118, 75, 162, 0.6)",
                }}
              />
            )}

            {/* Name */}
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#333" }}>
              {profile.name || "Anonymous"}
            </h1>

            {/* Bio */}
            <p style={{ marginTop: 8, color: "#666", fontSize: 16, fontStyle: "italic" }}>
              {profile.bio || "No bio yet."}
            </p>

            {/* Copy My Link */}
            <ExtraFeatures
              session={session}
              profile={profile}
              setProfile={setProfile}
              isEditing={false}
            />

            {/* Links */}
            <nav style={{ marginTop: 24, display: "grid", gap: 16 }}>
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    padding: "14px 0",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#fff",
                    background: "linear-gradient(90deg, #764ba2, #667eea)",
                    borderRadius: 14,
                    boxShadow: "0 8px 20px rgba(102, 126, 234, 0.6)",
                    textDecoration: "none",
                    transition: "background 0.3s ease, transform 0.15s ease",
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: 24 }}>
                    {link.icon}
                  </span>
                  {link.title}
                </a>
              ))}
            </nav>

            {/* Edit Profile Button */}
            <button
              onClick={() => setEditing(true)}
              style={{
                marginTop: 24,
                backgroundColor: "#764ba2",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "10px 20px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Edit Profile
            </button>
          </section>
        </main>
      )}
    </div>
  );
}

function PublicProfileWrapper() {
  const { userId } = useParams();
  return <PublicProfile userId={userId} />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/u/:userId" element={<PublicProfileWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}