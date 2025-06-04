// src/Auth.jsx
import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [justSignedUp, setJustSignedUp] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await supabase.auth.signInWithPassword({ email, password });
        onLogin();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setJustSignedUp(true);
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: 400,
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        {/* Project Name */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#764ba2",
            marginBottom: 16,
            letterSpacing: "0.5px",
          }}
        >
          Sageverse LinkTree
        </h1>

        <h2
          style={{
            marginBottom: 24,
            color: "#333",
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {justSignedUp ? (
          <p
            style={{
              color: "#444",
              marginBottom: 24,
              lineHeight: 1.5,
              fontSize: 14,
            }}
          >
            🎉 Thanks for signing up! <br />
            Please check your email to confirm your address before logging in.
          </p>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: 16,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 16,
                boxSizing: "border-box", // Ensure padding doesn't break layout
                transition: "border-color 0.2s ease",
              }}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: 16,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 16,
                boxSizing: "border-box",
                transition: "border-color 0.2s ease",
              }}
            />

            {error && (
              <p
                style={{
                  color: "red",
                  marginBottom: 16,
                  fontSize: 14,
                }}
              >
                {error}
              </p>
            )}

            <button
              onClick={handleAuth}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#764ba2",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(118,75,162,0.4)",
                marginBottom: 12,
              }}
            >
              {loading ? "Please wait…" : isLogin ? "Login" : "Sign Up"}
            </button>
          </>
        )}

        <p
          style={{
            fontSize: 14,
            color: "#764ba2",
            cursor: "pointer",
            marginTop: justSignedUp ? 24 : 0,
          }}
          onClick={() => {
            setJustSignedUp(false);
            setError(null);
            setIsLogin(!isLogin);
          }}
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}