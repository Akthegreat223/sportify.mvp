import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMatches } from '../hooks/useMatches';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Button } from '../components/Button';
import { Trophy, Users, Calendar, MapPin, Plus, ArrowRight, Share2, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import type { Match } from '../types';

// Page component
export default function Home() {
  const { profile } = useAuth();
  const { matches: displayMatches, loading } = useMatches();
  const [statIndex, setStatIndex] = React.useState(0);
  
  const stats = [
    `${Math.max(8, (displayMatches.length || 3) * 3)} players joined today`,
    `${Math.max(2, displayMatches.length || 3)} matches happening now`,
    `${Math.floor(Math.random() * 5) + 3} spots filled in last hour`
  ];

  React.useEffect(() => {
    if (stats.length === 0) return;
    const interval = setInterval(() => {
      setStatIndex((prev) => (prev + 1) % stats.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [stats.length]);
  
  const handleQuickJoin = async (e: React.MouseEvent, matchId: string, isJoined: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profile) return;

    try {
      const isJoining = !isJoined;
      const matchDoc = displayMatches.find(m => m.id === matchId);
      if (!matchDoc) return;

      const newPlayerCount = isJoining ? matchDoc.players.length + 1 : matchDoc.players.length - 1;
      const shouldConfirm = isJoining && newPlayerCount >= (matchDoc.maxPlayers - 2);

      await updateDoc(doc(db, 'matches', matchId), {
        players: isJoining ? arrayUnion(profile.uid) : arrayRemove(profile.uid),
        status: (shouldConfirm || matchDoc.status === 'confirmed') ? 'confirmed' : 'seeking_players'
      });

      if (isJoining) {
        if (shouldConfirm || matchDoc.status === 'confirmed') {
          alert(`✅ Match confirmed! See you at ${formatDate(matchDoc.dateTime)} 🎉`);
        } else {
          alert("✅ You're in! Invite more players to confirm this match faster.");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="pt-8 text-center space-y-6">
        <motion.div
          key={statIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="inline-block p-4 bg-neutral-900 dark:bg-white rounded-[2rem] mb-4 border border-white/10 dark:border-neutral-200 shadow-xl"
        >
          <div className="flex flex-col items-center gap-1">
            <Trophy className="w-8 h-8 text-primary" />
            <span className="text-[10px] font-black uppercase text-white dark:text-black tracking-widest leading-none">
              {stats[statIndex]}
            </span>
          </div>
        </motion.div>
        
        <div className="space-y-4 px-4 text-center">
          <h1 className="text-5xl font-black tracking-tight leading-[1.1] uppercase italic text-black dark:text-white">
            Find cricket matches <br />
            <span className="text-primary">near you</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-sm mx-auto">
            Join games in <span className="text-black dark:text-white font-bold">Gujrat</span> or host your own match now.
          </p>
        </div>

        <div className="flex flex-col gap-4 px-4 mt-8">
          <Link to="/matches" className="w-full">
            <Button className="w-full h-20 rounded-2xl text-xl font-black italic uppercase shadow-[0_0_50px_rgba(0,255,0,0.2)]">
              Join a Match Now
            </Button>
          </Link>
          <Link to="/matches?action=create" className="w-full">
            <Button variant="outline" className="w-full h-16 rounded-2xl border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-neutral-400">
              Host a Game
            </Button>
          </Link>
        </div>
      </section>

      {/* Match List Section */}
      <section className="px-2">
        <div className="mb-8 overflow-hidden rounded-2xl bg-neutral-900 dark:bg-white border border-white/5 dark:border-neutral-200 shadow-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#00FF00]" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white dark:text-black">🔥 Matches happening today</h2>
            </div>
            <div className="px-2 py-1 bg-white/10 dark:bg-neutral-100 rounded-md">
               <span className="text-[10px] font-black text-primary dark:text-black uppercase">{displayMatches.length} ACTIVE</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-44 bg-neutral-100 dark:bg-neutral-900 rounded-[2.5rem] animate-pulse" />)}
          </div>
        ) : displayMatches.length > 0 ? (
          <div className="space-y-6">
            {displayMatches.map((match) => {
              const spotsLeft = match.maxPlayers - match.players.length;
              const isFillingFast = spotsLeft <= 5 && spotsLeft > 3;

              // Starting Soon Logic (within 3 hours AND at least 6 players)
              const matchTime = new Date(match.dateTime).getTime();
              const nowTime = new Date().getTime();
              const isStartingSoon = matchTime > nowTime && 
                                     (matchTime - nowTime) < (3 * 60 * 60 * 1000) && 
                                     match.players.length >= 6;

              const handleShare = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                const isSeeking = match.status === 'seeking_players';
                const text = isSeeking 
                  ? `Cricket match in Gujrat — need a few more players. Join here: ${window.location.origin}/match/${match.id}`
                  : `Cricket match ${formatDate(match.dateTime)} in ${match.location} — join us! ${window.location.origin}/match/${match.id}`;
                if (navigator.share) {
                  navigator.share({ title: match.title, text, url: `${window.location.origin}/match/${match.id}` });
                } else {
                  navigator.clipboard.writeText(text);
                  alert('Invite message copied to clipboard!');
                }
              };

              return (
                <Link
                  key={match.id}
                  to={`/matches/${match.id}`}
                  className="group block bg-neutral-950 dark:bg-neutral-900/50 border border-white/5 rounded-[2.5rem] p-8 hover:bg-black dark:hover:bg-neutral-900 hover:border-primary/30 transition-all duration-300 relative overflow-hidden shadow-2xl"
                >
                  {isFillingFast && (
                    <div className="absolute top-0 right-0 bg-orange-500 text-black text-[10px] font-black px-6 py-2 rounded-bl-3xl uppercase italic z-10">
                      ⚡ Filling Fast
                    </div>
                  )}

                  {isStartingSoon && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-black px-6 py-2 rounded-br-3xl uppercase italic z-10 flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-white" /> Starting Soon
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-2">{match.sport}</p>
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white group-hover:text-primary transition-colors">
                        {match.title || "Evening Tape Ball Match"}
                      </h3>
                      <p className="text-[9px] font-bold text-neutral-400 uppercase mt-1">
                        👤 Hosted by {match.creatorName || 'Ali Khan'}
                      </p>
                      <div className="mt-3 flex gap-2">
                        {match.status === 'confirmed' ? (
                          <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Confirmed Match</span>
                          </div>
                        ) : (
                          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Looking for Players</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-white/5 px-4 py-3 rounded-2xl border border-white/5 text-center min-w-[84px] flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Trophy className="w-3 h-3 text-primary" />
                        <span className="text-xl font-black italic text-white leading-none">
                          {match.players.length}/{match.maxPlayers}
                        </span>
                      </div>
                      <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-tighter">PLAYERS JOINED</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 text-neutral-400">
                      <MapPin className="w-4 h-4 text-primary/60" />
                      <span className="text-xs font-bold uppercase truncate">{match.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-400">
                      <Calendar className="w-4 h-4 text-primary/60" />
                      <span className="text-xs font-bold uppercase italic">{formatDate(match.dateTime)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-4">
                     <div className="flex gap-3">
                        <Button 
                           onClick={(e) => handleQuickJoin(e, match.id, !!profile?.uid && match.players.includes(profile.uid))}
                           variant={profile?.uid && match.players.includes(profile.uid) ? 'secondary' : 'primary'}
                           className="flex-1 h-14 rounded-xl font-black text-lg group-hover:scale-[1.02] transition-transform"
                        >
                           {profile?.uid && match.players.includes(profile.uid) ? 'JOINED' : 'JOIN NOW'}
                        </Button>
                        <Button 
                           variant="secondary" 
                           onClick={handleShare}
                           className="h-14 rounded-xl flex items-center justify-center px-6 bg-white/5 border border-white/5 text-neutral-400 hover:text-white gap-2 transition-colors"
                        >
                           <Share2 className="w-5 h-5" />
                           <span className="text-xs font-black uppercase">Invite</span>
                        </Button>
                     </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-neutral-950 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <p className="text-neutral-400 font-bold uppercase text-sm mb-6">No matches yet in your area</p>
            <p className="text-neutral-500 text-xs mb-8 uppercase tracking-widest">Be the first to create one</p>
            <Link to="/matches?action=create">
              <Button variant="primary" className="rounded-full px-8">
                <Plus className="w-4 h-4 mr-2" /> Create Match
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
