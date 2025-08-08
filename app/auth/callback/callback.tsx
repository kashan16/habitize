import { useEffect } from 'react';

export default function Callback() {
  useEffect(() => {
    const hash = window.location.hash;
    // Redirect back to app with the auth hash
    if (hash) {
      window.location.href = `https://com.kashan.habitize/callback${hash}`;
    }
  }, []);

  return <p>Redirecting to app...</p>;
}
