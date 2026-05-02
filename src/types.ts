export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  stats?: {
    wins: number;
    matchesPlayed: number;
    points?: number;
  };
}

export interface Match {
  id: string;
  sport: string;
  title: string;
  location: string;
  dateTime: string;
  maxPlayers: number;
  players: string[]; // User IDs
  creatorId: string;
  creatorName?: string;
  status: 'seeking_players' | 'confirmed' | 'upcoming' | 'completed';
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}
