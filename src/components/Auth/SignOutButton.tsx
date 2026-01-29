'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabaseClient from '@/lib/supabaseClient';

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabaseClient.auth.signOut();
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/login');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleSignOut} className="ml-auto btn" disabled={loading}>
      {loading ? '...' : 'Гарах'}
    </button>
  );
}
