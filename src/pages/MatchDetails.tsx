import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/Button";
import {
  Trophy,
  Users,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  Share2,
  Zap,
} from "lucide-react";
import { formatDate, cn } from "../lib/utils";
import type { Match } from "../types";

export default function MatchDetails() {
  const unsubMatch = onSnapshot(doc(db, "matches", id), (doc) => {
    if (!doc.exists()) {
      setMatch(null);
      setLoading(false);
      return;
    }

    setMatch({ id: doc.id, ...doc.data() } as Match);
    setLoading(false);
  });
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    console.log(`[EVENT]: Match Details Viewed: ${id}`);
    const unsubMatch = onSnapshot(doc(db, "matches", id), (doc) => {
      if (doc.exists()) {
        setMatch({ id: doc.id, ...doc.data() } as Match);
      }
      setLoading(false);
    });
    return () => unsubMatch();
  }, [id]);

  const handleJoinLeave = async () => {
    if (!id || !profile || !match) return;
    const isJoined = match.players.includes(profile.uid);
    if (!isJoined && match.players.length >= match.maxPlayers) return;

    const isJoining = !isJoined;
    const newPlayerCount = isJoining
      ? match.players.length + 1
      : match.players.length - 1;
    const shouldConfirm = isJoining && newPlayerCount >= match.maxPlayers - 2;

    try {
      await updateDoc(doc(db, "matches", id), {
        players: isJoining ? arrayUnion(profile.uid) : arrayRemove(profile.uid),
        status: shouldConfirm ? "confirmed" : match.status,
      });

      if (isJoining) {
        if (shouldConfirm || match.status === "confirmed") {
          alert(
            `✅ Match confirmed! See you at ${formatDate(match.dateTime)} 🎉`,
          );
        } else {
          alert(
            "✅ You're in! Invite more players to confirm this match faster.",
          );
        }
      }
      console.log(
        `[EVENT]: Match ${isJoining ? "Joined" : "Left"} (Details Page)`,
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-black transition-colors">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!match)
    return (
      <div className="h-screen flex flex-col items-center justify-center p-8 text-center space-y-6 bg-white dark:bg-black transition-colors">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-black dark:text-white">
          Match no longer available
        </h2>

        <p className="text-neutral-500 dark:text-neutral-400 max-w-xs uppercase font-bold text-[10px] tracking-widest">
          This match may have been removed or never existed
        </p>

        <button
          onClick={() => navigate(-1)}
          className="rounded-full px-8 h-14 bg-green-500 text-black font-black italic uppercase"
        >
          Go Back
        </button>
      </div>
    );

  const isJoined = profile?.uid ? match.players.includes(profile.uid) : false;

  const handleShare = () => {
    const isSeeking = match.status === "seeking_players";
    const text = isSeeking
      ? `Cricket match in Gujrat — need a few more players. Join here: ${window.location.origin}/match/${match.id}`
      : `Cricket match ${formatDate(match.dateTime)} in ${match.location} — join us! ${window.location.origin}/match/${match.id}`;
    if (navigator.share) {
      navigator.share({ title: match.title, text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      alert("Invite message copied to clipboard!");
    }
  };

  // Starting Soon Logic (within 3 hours AND at least 6 players)
  const matchTime = new Date(match.dateTime).getTime();
  const nowTime = new Date().getTime();
  const isStartingSoon =
    matchTime > nowTime &&
    matchTime - nowTime < 3 * 60 * 60 * 1000 &&
    match.players.length >= 6;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-white/5 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-black dark:text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none text-black dark:text-white">
            Match Details
          </h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">
            Gujrat, Pakistan
          </p>
        </div>
      </div>

      <section className="bg-neutral-950 dark:bg-neutral-900/50 border border-white/10 rounded-[3rem] p-10 space-y-10 relative overflow-hidden shadow-2xl">
        {isStartingSoon && (
          <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-black px-8 py-3 rounded-br-[2rem] uppercase italic z-20 flex items-center gap-2">
            <Zap className="w-4 h-4 fill-white" /> Starting Soon
          </div>
        )}
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Trophy className="w-40 h-40 rotate-12 fill-white" />
        </div>

        <div className="space-y-4 relative z-10">
          <p className="text-[10px] font-black uppercase text-primary italic tracking-widest">
            {match.sport}
          </p>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-[1] text-white">
              {match.title || "Evening Tape Ball Match"}
            </h2>
            <div className="flex gap-2">
              {match.status === "confirmed" ? (
                <div className="px-4 py-2 bg-green-500 text-black text-[10px] font-black uppercase italic rounded-full shadow-lg shadow-green-500/20">
                  Confirmed
                </div>
              ) : (
                <div className="px-4 py-2 bg-blue-500 text-white text-[10px] font-black uppercase italic rounded-full shadow-lg shadow-blue-500/20">
                  Seeking Players
                </div>
              )}
            </div>
          </div>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            👤 Hosted by {match.creatorName || "Premium Host"}
          </p>
          {match.status === "seeking_players" && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                📢 Game will be confirmed once enough players join
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center gap-2 text-white">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold uppercase tracking-wide">
                {match.location}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold uppercase tracking-wide">
                {formatDate(match.dateTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/5 relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-2">
              Team Size
            </p>
            <div className="text-3xl font-black italic text-white">
              {match.maxPlayers}{" "}
              <span className="text-xs text-neutral-500 uppercase">
                Players
              </span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-2">
              Spots Open
            </p>
            <div className="text-3xl font-black italic text-white">
              {match.maxPlayers - match.players.length}{" "}
              <span className="text-xs text-neutral-500 uppercase">Left</span>
            </div>
          </div>
        </div>

        <div className="pt-4 relative z-10 space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={handleJoinLeave}
              variant={isJoined ? "outline" : "primary"}
              className={cn(
                "flex-1 h-20 rounded-[2rem] text-xl font-black uppercase italic shadow-2xl transition-all",
                !isJoined && "shadow-primary/20 hover:scale-[1.02]",
                isJoined && "border-white/10 text-white hover:bg-white/5",
              )}
            >
              {isJoined ? "Exit Match" : "Join Match Now"}
            </Button>
            <Button
              onClick={handleShare}
              variant="secondary"
              className="h-20 px-8 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-center gap-3 transition-colors hover:text-white text-neutral-400 font-black uppercase italic text-sm"
            >
              <Share2 className="w-6 h-6" />
              <span>Invite</span>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4">
        <h3 className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-6">
          Confirmed Players ({match.players.length})
        </h3>
        <div className="flex flex-wrap gap-4">
          {match.players.map((pid, index) => (
            <div
              key={`${pid}-${index}`}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 rounded-full bg-neutral-900 border border-white/10 overflow-hidden shadow-lg">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pid === "system" ? `${pid}_${index}` : pid}&topType=shortHair,turban,shaved,hat,shortHair,shortHair,shortHair`}
                  alt="P"
                />
              </div>
              <span className="text-[8px] font-bold text-neutral-500 uppercase">
                {pid.startsWith("system") ? `Player ${index + 1}` : "Player"}
              </span>
            </div>
          ))}
          {match.players.length === 0 && (
            <p className="text-neutral-500 text-xs font-bold uppercase italic">
              No one has joined yet. Be the first!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
