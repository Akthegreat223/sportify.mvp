import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { Match } from '../types';

const INITIAL_MATCHES = [
  {
    sport: 'Cricket',
    title: 'Evening Tape Ball Match',
    location: 'Shadman Ground, Gujrat',
    dateTime: new Date(Date.now() + 3600000).toISOString(),
    maxPlayers: 11,
    players: Array.from({ length: 9 }, (_, i) => `system_evening_${i}`),
    creatorId: 'system',
    creatorName: 'Ali Khan',
    status: 'seeking_players',
    createdAt: new Date().toISOString(),
  },
  {
    sport: 'Cricket',
    title: 'Weekend Championship',
    location: 'Fawara Chowk, Gujrat',
    dateTime: new Date(Date.now() + 86400000).toISOString(),
    maxPlayers: 22,
    players: Array.from({ length: 20 }, (_, i) => `system_weekend_${i}`),
    creatorId: 'system',
    creatorName: 'Usman Butt',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    sport: 'Cricket',
    title: 'Morning Practice Match',
    location: 'Jinnah Park Ground',
    dateTime: new Date(Date.now() + 172800000).toISOString(),
    maxPlayers: 11,
    players: Array.from({ length: 8 }, (_, i) => `system_morning_${i}`),
    creatorId: 'system',
    creatorName: 'Hamza Malik',
    status: 'seeking_players',
    createdAt: new Date().toISOString(),
  },
  {
    sport: 'Cricket',
    title: 'Late Night T10 Bash',
    location: 'GT Road Stadium',
    dateTime: new Date(Date.now() + 3600000).toISOString(),
    maxPlayers: 11,
    players: Array.from({ length: 10 }, (_, i) => `system_night_${i}`),
    creatorId: 'system',
    creatorName: 'Zain Raza',
    status: 'seeking_players',
    createdAt: new Date().toISOString(),
  }
];

export function useMatches(sport?: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seeding Check - Run when auth is ready
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      
      try {
        const snap = await getDocs(collection(db, 'matches'));
        if (snap.size < 4) {
          console.log('[SEED]: Database empty or low count, seeding matches...');
          for (const match of INITIAL_MATCHES) {
            const isDuplicate = snap.docs.some(docSnapshot => {
              const data = docSnapshot.data();
              return data.title === match.title && data.location === match.location;
            });
            
            if (!isDuplicate) {
              await addDoc(collection(db, 'matches'), match);
            }
          }
        }
      } catch (err) {
        console.error('[SEED ERROR]:', err);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let q = query(
      collection(db, 'matches'),
      orderBy('dateTime', 'asc'),
      limit(20)
    );

    if (sport) {
      q = query(q, where('sport', '==', sport));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matchData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Match[];
      setMatches(matchData);
      setLoading(false);
    }, (error) => {
      console.error("Match fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sport]);

  return { matches, loading };
}
