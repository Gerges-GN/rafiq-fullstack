import { useState, useEffect, useRef } from "react";


const BASE_URL = import.meta.env.VITE_API_URL;
const PROFILE_POLL_INTERVAL_MS = 30000; // profile data changes rarely, poll gently
export default function useParticipantProfile(participantId, currentUserRole) {
  const [profile, setProfile] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!participantId) return;

    // currentUserRole is *my* role — the participant is the opposite side.
    const endpoint =
      currentUserRole === "tourist"
        ? `${BASE_URL}/tourguide-profiles/owner/${participantId}`
        : `${BASE_URL}/profiles/${participantId}`;

    let cancelled = false;

    const fetchProfile = () => {
      fetch(endpoint)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch participant profile");
          return res.json();
        })
        .then((data) => {
          if (!cancelled) setProfile(data);
        })
        .catch((error) => {
          console.error("Failed to fetch participant profile:", error);
        });
    };

    fetchProfile();
    intervalRef.current = setInterval(fetchProfile, PROFILE_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [participantId, currentUserRole]);

  return profile;
}