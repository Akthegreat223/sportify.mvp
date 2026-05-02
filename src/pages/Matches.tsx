import React, { useState, useEffect } from 'react';
import { useMatches } from '../hooks/useMatches';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Button } from '../components/Button';
import { Plus, Trophy, MapPin, Calendar, X, ChevronDown, Users, Share2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate } from '../lib/utils';
import { Link, useSearchParams } from 'react-router-dom';

// Page component
export default function Matches() {
  const { matches, loading } = useMatches();
  const { profile } = useAuth();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreating, setIsCreating] = useState(searchParams.get('action') === 'create');
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [form, setForm] = useState({
    title: '',
    location: 'Gujrat, Pakistan',
    dateTime: '',
    maxPlayers: 22,
  });

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsCreating(true);
    }
  }, [searchParams]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Safety check for players
    if (form.maxPlayers < 2) return;
    if (!form.dateTime) return;

    try {
      await addDoc(collection(db, 'matches'), {
        ...form,
        sport: 'Cricket',
        players: [profile.uid],
        creatorId: profile.uid,
        creatorName: profile.name || 'Pro Player',
        status: 'seeking_players',
        createdAt: new Date().toISOString(),
      });
      console.log('[EVENT]: Match Created');
      setIsCreating(false);
      setIsCustomSelected(false);
      setSearchParams({});
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickJoin = async (e: React.MouseEvent, matchId: string, isJoined: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profile) return;

    try {
      const isJoining = !isJoined;
      const matchDoc = matches.find(m => m.id === matchId);
      if (!matchDoc) return;

      const newPlayerCount = isJoining ? matchDoc.players.length + 1 : matchDoc.players.length - 1;
      const shouldConfirm = isJoining && newPlayerCount >= (matchDoc.maxPlayers - 2);

      await updateDoc(doc(db, 'matches', matchId), {
        players: isJoining ? arrayUnion(profile.uid) : arrayRemove(profile.uid),
        status: shouldConfirm ? 'confirmed' : (matchDoc.status || 'seeking_players')
      });

      if (isJoining) {
        if (shouldConfirm || matchDoc.status === 'confirmed') {
          alert(`✅ Match confirmed! See you at ${formatDate(matchDoc.dateTime)} 🎉`);
        } else {
          alert("✅ You're in! Invite more players to confirm this match faster.");
        }
      }
      
      console.log(`[EVENT]: Match ${isJoining ? 'Joined' : 'Left'} (Quick Join)`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-black dark:text-white">Games</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Gujrat, Pakistan</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)} 
          size="sm" 
          className="rounded-full px-6 h-12 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Host
        </Button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsCreating(false); setIsCustomSelected(false); setSearchParams({}); }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl"
            >
              <button 
                onClick={() => { setIsCreating(false); setIsCustomSelected(false); setSearchParams({}); }}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-8">
                 <h2 className="text-2xl font-black italic uppercase text-white">Host Cricket Match</h2>
                 <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Gujrat Regional Office</p>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-neutral-500 mb-2 block">Match Title</label>
                  <input
                    required
                    placeholder="e.g. Evening Tape Ball"
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-primary outline-none transition-colors text-white placeholder:text-neutral-600"
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-neutral-500 mb-2 block">Location</label>
                    <input
                      required
                      className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-primary outline-none transition-colors text-white"
                      value={form.location}
                      onChange={e => setForm({...form, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-neutral-500 mb-2 block">Max Players</label>
                    <input
                      type="number"
                      required
                      min="2"
                      className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-primary outline-none transition-colors text-white"
                      value={form.maxPlayers}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setForm({...form, maxPlayers: isNaN(val) ? 2 : val});
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-neutral-500 mb-2 block">Date & Time</label>
                  <div className="space-y-3">
                    <div className="relative">
                      <select 
                        className="w-full bg-black border border-white/10 rounded-2xl p-4 pr-10 text-sm font-bold focus:border-primary outline-none transition-colors appearance-none text-white"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            setIsCustomSelected(false);
                            return;
                          }
                          
                          if (val === 'custom') {
                            setIsCustomSelected(true);
                            setForm({...form, dateTime: ''});
                            return;
                          }
                          
                          setIsCustomSelected(false);
                          const now = new Date();
                          let targetDate = new Date();
                          
                          if (val.includes('tomorrow')) {
                            targetDate.setDate(now.getDate() + 1);
                          } else if (val.includes('sat')) {
                            const daysToAdd = (6 - now.getDay() + 7) % 7 || 7;
                            targetDate.setDate(now.getDate() + daysToAdd);
                          } else if (val.includes('sun')) {
                            const daysToAdd = (0 - now.getDay() + 7) % 7 || 7;
                            targetDate.setDate(now.getDate() + daysToAdd);
                          }

                          const hour = parseInt(val.split('-').pop() || '18');
                          targetDate.setHours(hour, 0, 0, 0);
                          
                          const formatted = targetDate.toISOString().slice(0, 16);
                          setForm({...form, dateTime: formatted});
                        }}
                      >
                        <option value="">Select a time slot...</option>
                        <optgroup label="Today">
                          <option value="today-17">Today - 05:00 PM</option>
                          <option value="today-20">Today - 08:00 PM</option>
                        </optgroup>
                        <optgroup label="Tomorrow">
                          <option value="tomorrow-09">Tomorrow - 09:00 AM</option>
                          <option value="tomorrow-17">Tomorrow - 05:00 PM</option>
                        </optgroup>
                        <optgroup label="Upcoming Weekend">
                          <option value="sat-16">Saturday - 04:00 PM</option>
                          <option value="sun-10">Sunday - 10:00 AM</option>
                        </optgroup>
                        <option value="custom">Choose Custom Date...</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>

                    {isCustomSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <input
                          type="datetime-local"
                          required
                          className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-primary outline-none transition-colors text-white"
                          value={form.dateTime}
                          onChange={e => setForm({...form, dateTime: e.target.value})}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 rounded-2xl text-lg mt-4">
                  Host Match
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="space-y-6">
        {loading ? (
          [1,2].map(i => <div key={i} className="h-32 bg-neutral-100 dark:bg-neutral-900 rounded-3xl animate-pulse" />)
        ) : matches.length > 0 ? (
          matches.map(match => {
            const spotsLeft = match.maxPlayers - match.players.length;
            const isFillingFast = spotsLeft <= 5 && spotsLeft > 3;
            const isJoined = profile?.uid ? match.players.includes(profile.uid) : false;

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
              <Link key={match.id} to={`/matches/${match.id}`}>
                 <motion.div 
                   whileTap={{ scale: 0.98 }}
                   className="bg-neutral-950 dark:bg-neutral-900/50 border border-white/10 p-8 rounded-[2.5rem] group hover:border-primary/20 transition-all relative overflow-hidden shadow-2xl"
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

                   <div className="flex items-center justify-between mb-6">
                      <div className="space-y-3">
                         <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">{match.sport}</div>
                         <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                           {match.title || 'Evening Tape Ball Match'}
                         </h3>
                         <p className="text-[9px] font-bold text-neutral-400 uppercase mt-1">
                           👤 Hosted by {match.creatorName || 'Pro Player'}
                         </p>
                         <div className="mt-3 flex gap-2">
                           {match.status === 'confirmed' ? (
                             <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-1.5">
                               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                               <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Confirmed</span>
                             </div>
                           ) : (
                             <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-1.5">
                               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                               <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Seeking Players</span>
                             </div>
                           )}
                         </div>
                      </div>
                      <div className="bg-white/5 px-4 py-3 rounded-[1.5rem] border border-white/5 text-center min-w-[84px] flex flex-col items-center justify-center">
                         <div className="flex items-center gap-1.5 mb-1">
                            <Trophy className="w-3 h-3 text-primary" />
                            <div className="text-xl font-black italic text-white leading-none">{match.players.length}/{match.maxPlayers}</div>
                         </div>
                         <div className="text-[8px] font-bold text-neutral-500 uppercase tracking-tighter">PLAYERS JOINED</div>
                      </div>
                   </div>

                   <div className="space-y-3 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3 text-neutral-400">
                         <MapPin className="w-4 h-4 text-primary/60" />
                         <span className="text-xs font-bold uppercase truncate tracking-wide">{match.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-neutral-400">
                         <Calendar className="w-4 h-4 text-primary/60" />
                         <span className="text-xs font-bold uppercase italic tracking-wide">{formatDate(match.dateTime)}</span>
                      </div>
                   </div>

                   <div className="mt-8 space-y-4">
                      <div className="flex gap-3">
                        <Button 
                          onClick={(e) => handleQuickJoin(e, match.id, isJoined)}
                          variant={isJoined ? 'secondary' : 'primary'}
                          className="flex-1 h-14 rounded-2xl font-black text-lg group-hover:scale-[1.02] transition-transform"
                        >
                           {isJoined ? 'JOINED' : 'JOIN NOW'}
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
                 </motion.div>
              </Link>
            );
          })
        ) : (
          <div className="py-20 text-center bg-neutral-950 rounded-[2.5rem] border border-white/10 shadow-2xl">
             <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
             <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">No active matches found</p>
             <button onClick={() => setIsCreating(true)} className="mt-4 text-primary font-bold text-[10px] uppercase underline">Host the first one</button>
          </div>
        )}
      </div>
    </div>
  );
}
