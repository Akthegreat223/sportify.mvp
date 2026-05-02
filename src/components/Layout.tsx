import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BottomNav } from './BottomNav';
import { ThemeToggle } from './ThemeToggle';

export function Layout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-neutral-950 dark:text-white pb-24 transition-colors duration-300">
      <ThemeToggle />
      <div className="max-w-lg mx-auto px-4 pt-6">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
