import { useEffect, useRef, useState } from "react";
import { isGoogleConfigured, loadGoogleIdentityScript } from "../utils/google.ts";

interface GoogleSignInButtonProps {
  text?: "signin_with" | "continue_with" | "signup_with";
  onCredential: (credential: string) => void;
}

const GoogleSignInButton = ({ text = "continue_with", onCredential }: GoogleSignInButtonProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onCredential);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;

    const renderGoogleButton = async () => {
      if (!isGoogleConfigured()) {
        setError("Connexion Google indisponible tant que VITE_GOOGLE_CLIENT_ID n'est pas renseigne.");
        return;
      }

      await loadGoogleIdentityScript();

      if (cancelled || !containerRef.current || !window.google?.accounts.id) {
        return;
      }

      containerRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID!,
        callback: (response) => {
          if (response.credential) {
            callbackRef.current(response.credential);
          }
        },
        ux_mode: "popup",
      });

      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text,
        logo_alignment: "left",
        width: 360,
        locale: "fr",
      });
    };

    renderGoogleButton().catch((renderError) => {
      setError(renderError instanceof Error ? renderError.message : "Connexion Google indisponible");
    });

    return () => {
      cancelled = true;
      window.google?.accounts.id.cancel();
    };
  }, [text]);

  if (error) {
    return <p className="text-sm text-muted">{error}</p>;
  }

  return <div ref={containerRef} className="flex justify-center"></div>;
};

export default GoogleSignInButton;
