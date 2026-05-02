import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { Button } from '../components/Button';
import { Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { ThemeToggle } from '../components/ThemeToggle';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6 text-black dark:text-white overflow-hidden relative transition-colors duration-300 font-sans">
      <ThemeToggle />
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex flex-col items-center max-w-sm w-full text-center"
      >
        <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-8 rotate-12">
          <Trophy className="w-10 h-10 text-primary -rotate-12" />
        </div>
        
        <h1 className="text-6xl font-black mb-4 tracking-tighter uppercase italic text-black dark:text-white">
          Sport<span className="text-primary italic">ify</span>
        </h1>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-12 text-sm leading-relaxed px-4">
          Find players nearby, join matches, and track your performance.
          The ultimate platform for competitive sports.
        </p>

        {error && (
          <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 text-xs border border-red-500/20 w-full">
            {error}
          </div>
        )}

        <Button
          onClick={handleGoogleLogin}
          isLoading={loading}
          className="w-full h-14 rounded-full flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 pointer-events-none" />
          Continue with Google
        </Button>

        <p className="mt-8 text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
          Level up your game
        </p>
      </motion.div>
    </div>
  );
}
