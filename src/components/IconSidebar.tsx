'use client';

import Link from 'next/link';
import { FiHome, FiBarChart2, FiCalendar, FiCheckSquare, FiZap, FiBookOpen } from 'react-icons/fi';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Dashboard', icon: FiHome },
  { href: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/calendar', label: 'Calendar', icon: FiCalendar },
  { href: '/planning', label: 'Planning', icon: FiCheckSquare },
  { href: '/insights', label: 'Insights', icon: FiZap },
  { href: '/review', label: 'Review', icon: FiBookOpen },
];

export default function IconSidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        flexDirection: 'column',
        gap: '10px',
        width: '64px',
        padding: '10px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--background)',
        borderRight: '1px solid var(--panel-muted)',
      }}
      className="hidden md:flex"
      aria-label="Main navigation"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '48px',
          marginBottom: '8px',
        }}
      >
        <div className="w-10 h-10 rounded-md flex items-center justify-center gradient-purple text-white font-bold text-sm" style={{ boxShadow: 'var(--shadow-floating)' }}>
          YM
        </div>
      </div>

      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center',
        flex: 1,
      }}>
        {items.map((it) => {
          const ActiveIcon = it.icon;
          const isActive = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              title={it.label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                background: isActive ? 'linear-gradient(135deg, var(--purple-base) 0%, rgba(139,92,246,0.12) 100%)' : 'transparent',
                color: isActive ? 'white' : 'var(--neutral-color)',
                border: isActive ? 'none' : `1px solid var(--card-border)`,
                boxShadow: isActive ? '0 6px 18px rgba(139, 92, 246, 0.12)' : 'none',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute -left-2 w-1 h-6 rounded bg-gradient-to-b"
                  style={{ background: 'linear-gradient(180deg, var(--purple-base), var(--purple-dark))' }}
                />
              )}
              <ActiveIcon style={{ width: '18px', height: '18px' }} />
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: 'auto',
          fontSize: '12px',
          color: 'var(--neutral-color)',
          textAlign: 'center',
          paddingBottom: '8px',
        }}
      >
        v0.1
      </div>
    </aside>
  );
}
