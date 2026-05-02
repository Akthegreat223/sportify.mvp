import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/Button';
import { LogOut, User, Mail, Calendar, Trophy, Star, Shield, Sun, Moon } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { motion } from 'motion/react';

export default function Profile() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!profile) return null;

  return (
    <div className="space-y-10 pb-12">
      {/* Profile Header */}
      <section className="text-center pt-8 relative">
        <div className="absolute top-0 right-0 p-4">
           <div className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-2xl flex items-center gap-2">
              <Star className="w-4 h-4 fill-primary" />
              <span className="text-[10px] font-black uppercase italic tracking-wider">Top 5% This Week</span>
           </div>
        </div>

        <div className="relative inline-block mt-4">
          <div className="w-40 h-40 rounded-[3rem] bg-neutral-100 dark:bg-neutral-900 border-2 border-primary overflow-hidden mx-auto p-1.5 shadow-[0_0_50px_rgba(0,255,0,0.1)]">
             <img 
               src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}&topType=shortHair,turban,shaved,hat,shortHair,shortHair,shortHair`} 
               alt="Profile" 
               className="w-full h-full object-cover rounded-[2.5rem]"
               referrerPolicy="no-referrer"
             />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white dark:bg-black border border-neutral-200 dark:border-white/10 p-3 rounded-2xl shadow-xl">
             <Shield className="w-5 h-5 text-primary" />
          </div>
        </div>
        
        <div className="mt-8 space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-black dark:text-white">{profile.name}</h1>
          <div className="flex items-center justify-center gap-2 text-neutral-600 font-bold uppercase text-[10px] tracking-widest">
            <Mail className="w-3 h-3" /> {profile.email}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4 px-2">
         <motion.div 
           whileHover={{ scale: 1.02 }}
           className="bg-neutral-950 dark:bg-white border border-white/10 dark:border-neutral-200 rounded-[2rem] p-6 text-center shadow-xl"
         >
            <Trophy className="w-5 h-5 mx-auto mb-3 text-primary" />
            <div className="text-3xl font-black italic mb-1 text-white dark:text-black">{profile.stats?.wins || 0}</div>
            <div className="text-[8px] font-black uppercase text-neutral-400 dark:text-neutral-600 tracking-[0.2em]">Wins</div>
         </motion.div>
         <motion.div 
           whileHover={{ scale: 1.02 }}
           className="bg-neutral-950 dark:bg-white border border-white/10 dark:border-neutral-200 rounded-[2rem] p-6 text-center shadow-xl"
         >
            <User className="w-5 h-5 mx-auto mb-3 text-primary" />
            <div className="text-3xl font-black italic mb-1 text-white dark:text-black">{profile.stats?.matchesPlayed || 0}</div>
            <div className="text-[8px] font-black uppercase text-neutral-400 dark:text-neutral-600 tracking-[0.2em]">Games</div>
         </motion.div>
      </section>

      {/* Basic Info */}
      <section className="bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-[2.5rem] p-8 space-y-6">
        <div className="flex items-center justify-between py-2 border-b border-neutral-200 dark:border-white/5">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-200/50 dark:bg-white/5 flex items-center justify-center">
                 <Calendar className="w-5 h-5 text-neutral-400 dark:text-neutral-600" />
              </div>
              <div>
                 <p className="text-[8px] font-black uppercase text-neutral-400 dark:text-neutral-600 tracking-widest leading-none mb-1">Member Since</p>
                 <p className="text-sm font-bold uppercase italic text-black dark:text-white">{formatDate(profile.createdAt)}</p>
              </div>
           </div>
        </div>
        <div className="flex items-center justify-between pt-2">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-200/50 dark:bg-white/5 flex items-center justify-center">
                 <User className="w-5 h-5 text-neutral-400 dark:text-neutral-600" />
              </div>
              <div>
                 <p className="text-[8px] font-black uppercase text-neutral-400 dark:text-neutral-600 tracking-widest leading-none mb-1">Status</p>
                 <p className="text-sm font-bold uppercase italic text-primary">Active Athlete</p>
              </div>
           </div>
        </div>
      </section>

      {/* Theme Settings */}
      <section className="bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-[2.5rem] p-8 space-y-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-200/50 dark:bg-white/5 flex items-center justify-center">
                 {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-orange-500" />}
              </div>
              <div>
                 <p className="text-[8px] font-black uppercase text-neutral-400 dark:text-neutral-600 tracking-widest leading-none mb-1">Appearance</p>
                 <p className="text-sm font-bold uppercase italic text-black dark:text-white">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
              </div>
           </div>
           <button 
             onClick={toggleTheme}
             className="w-14 h-8 rounded-full bg-neutral-200 dark:bg-white/10 relative p-1 transition-colors"
           >
             <div className={`w-6 h-6 rounded-full bg-primary shadow-lg transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
           </button>
        </div>
      </section>

      {/* Logout */}
      <section className="px-4">
        <Button 
          onClick={() => signOut()} 
          variant="secondary" 
          className="w-full h-16 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-200 hover:text-black transition-all flex items-center justify-center gap-3"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-black uppercase italic tracking-widest">Sign Out</span>
        </Button>
      </section>
    </div>
  );
}
