'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function check() {
      // don't guard the login route or public assets
      if (
        pathname?.startsWith('/login') ||
        pathname?.startsWith('/api') ||
        pathname?.startsWith('/_next')
      ) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me');
        if (!mounted) return;
        if (res.ok) {
          setLoading(false);
          return;
        }
        // not authorized -> push to login
        const url = new URL('/login', window.location.origin);
        url.searchParams.set('redirectedFrom', pathname || '/');
        router.push(url.pathname + url.search);
      } catch (err) {
        const url = new URL('/login', window.location.origin);
        url.searchParams.set('redirectedFrom', pathname || '/');
        router.push(url.pathname + url.search);
      }
    }

    check();
    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  // render nothing while checking; avoids flashing protected UI
  return null;
}
