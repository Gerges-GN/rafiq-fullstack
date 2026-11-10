import { useState, useEffect, useRef } from "react";
import { authFetch } from '../../../services/authFetch';


const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const PROFILE_POLL_INTERVAL_MS = 30000; // profile data changes rarely, poll gently
export default function useParticipantProfile(participantId, currentUserRole, embeddedProfile = null) {
  const [loadedProfile, setLoadedProfile] = useState({ participantId: null, profile: null });
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!participantId) return;
    if (embeddedProfile && String(embeddedProfile._id) === String(participantId)) return;
    if (currentUserRole !== 'tourist') return;
    // currentUserRole is *my* role — the participant is the opposite side.
    const endpoint = `${BASE_URL}/tourguide-profiles/owner/${participantId}`;
    let cancelled = false;

    const fetchProfile = () => {
      authFetch(endpoint)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch participant profile");
          return res.json();
        })
        .then((data) => {
          if (!cancelled) setLoadedProfile({ participantId, profile: data });
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
  }, [participantId, currentUserRole, embeddedProfile]);

  if (!participantId) return null;
  if (embeddedProfile && String(embeddedProfile._id) === String(participantId)) return embeddedProfile;
  if (currentUserRole !== 'tourist') return null;
  return loadedProfile.participantId === participantId ? loadedProfile.profile : null;
}
