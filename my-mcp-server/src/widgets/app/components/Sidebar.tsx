'use client';

import React from 'react';

interface SidebarProps {
  currentView: 'dashboard' | 'stream' | 'genome' | 'interventions';
  onNavigate: (view: 'dashboard' | 'stream' | 'genome' | 'interventions') => void;
  activeAlertsCount: number;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onSimulateEvent: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  activeAlertsCount,
  isStreaming,
  onToggleStreaming,
  onSimulateEvent,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Executive Heatmap',
      path: '/dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      badge: null,
    },
    {
      id: 'stream',
      label: 'Live Telemetry Stream',
      path: '/stream',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      badge: isStreaming ? 'LIVE' : 'PAUSED',
      badgeColor: isStreaming ? '#10B981' : '#F59E0B',
    },
    {
      id: 'genome',
      label: 'Genome Management',
      path: '/genome',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 15c6.667-6 13.333 0 20-6" />
          <path d="M2 9c6.667 6 13.333 0 20 6" />
          <line x1="12" y1="3" x2="12" y2="21" />
        </svg>
      ),
      badge: '5 OKRs',
    },
    {
      id: 'interventions',
      label: 'Nudge & Interventions',
      path: '/interventions',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      badge: activeAlertsCount > 0 ? `${activeAlertsCount} Alert${activeAlertsCount > 1 ? 's' : ''}` : null,
      badgeColor: '#EF4444',
    },
  ];

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      backgroundColor: '#0E131F',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      userSelect: 'none',
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px 18px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3a9 9 0 0 1 6.36 15.36" />
            <path d="M12 3a9 9 0 0 0-6.36 15.36" />
            <circle cx="12" cy="12" r="3" fill="#FFFFFF" />
          </svg>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.5px', color: '#FFFFFF' }}>HELIX</span>
            <span style={{
              fontSize: '9px',
              fontWeight: 600,
              padding: '2px 5px',
              borderRadius: '4px',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              color: '#818CF8',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}>v2.4</span>
          </div>
          <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>Cognitive Genome Platform</p>
        </div>
      </div>

      {/* Live Stream Telemetry Indicator */}
      <div style={{
        margin: '14px 16px 6px 16px',
        padding: '10px 12px',
        borderRadius: '8px',
        backgroundColor: 'rgba(22, 27, 38, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="live-pulse" style={{ backgroundColor: isStreaming ? '#10B981' : '#F59E0B' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#D1D5DB' }}>
            {isStreaming ? 'Telemetry Active' : 'Stream Paused'}
          </span>
        </div>
        <button
          onClick={onToggleStreaming}
          style={{
            background: 'none',
            border: 'none',
            color: '#818CF8',
            fontSize: '11px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          {isStreaming ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* Navigation Menu */}
      <div style={{ padding: '12px 10px', flex: 1 }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '4px 10px 8px 10px' }}>
          Navigation
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#9CA3AF',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: isActive ? '#818CF8' : '#6B7280' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    backgroundColor: item.badgeColor ? `${item.badgeColor}22` : 'rgba(255, 255, 255, 0.08)',
                    color: item.badgeColor || '#9CA3AF',
                    border: `1px solid ${item.badgeColor ? `${item.badgeColor}44` : 'transparent'}`,
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Simulator Quick Trigger Action */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <button
          onClick={onSimulateEvent}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(67, 56, 202, 0.2) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#A5B4FC',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Inject Signal Event
        </button>
      </div>

      {/* Footer Info */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundColor: '#090D15',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
          color: '#818CF8',
        }}>
          CX
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#E5E7EB', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            Executive Operations
          </div>
          <div style={{ fontSize: '10px', color: '#6B7280' }}>
            Enterprise Tenant #8402
          </div>
        </div>
      </div>
    </aside>
  );
};
