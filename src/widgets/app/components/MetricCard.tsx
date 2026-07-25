'use client';

import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trendBadge?: {
    text: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  progressPercentage?: number;
  statusColor?: 'emerald' | 'amber' | 'rose' | 'indigo';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trendBadge,
  progressPercentage,
  statusColor = 'indigo',
  icon,
}) => {
  const getColorHex = (color: string) => {
    switch (color) {
      case 'emerald': return '#10B981';
      case 'amber': return '#F59E0B';
      case 'rose': return '#EF4444';
      default: return '#6366F1';
    }
  };

  const accentHex = getColorHex(statusColor);

  return (
    <div className="glass-panel" style={{
      padding: '18px 20px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '125px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
    }}>
      {/* Top accent glow line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg, ${accentHex} 0%, transparent 100%)`,
      }} />

      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </span>
        {icon && (
          <div style={{
            color: accentHex,
            backgroundColor: `${accentHex}18`,
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {icon}
          </div>
        )}
      </div>

      {/* Value Row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{ fontSize: '26px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
          {value}
        </span>

        {trendBadge && (
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '12px',
            backgroundColor: trendBadge.isNeutral
              ? 'rgba(156, 163, 175, 0.15)'
              : trendBadge.isPositive
              ? 'rgba(16, 185, 129, 0.15)'
              : 'rgba(239, 68, 68, 0.15)',
            color: trendBadge.isNeutral
              ? '#9CA3AF'
              : trendBadge.isPositive
              ? '#10B981'
              : '#EF4444',
            border: `1px solid ${
              trendBadge.isNeutral
                ? 'rgba(156, 163, 175, 0.3)'
                : trendBadge.isPositive
                ? 'rgba(16, 185, 129, 0.3)'
                : 'rgba(239, 68, 68, 0.3)'
            }`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}>
            {trendBadge.text}
          </span>
        )}
      </div>

      {/* Progress Bar or Subtitle */}
      {progressPercentage !== undefined ? (
        <div style={{ marginTop: '12px' }}>
          <div style={{
            height: '5px',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, progressPercentage))}%`,
              backgroundColor: accentHex,
              boxShadow: `0 0 8px ${accentHex}`,
              transition: 'width 0.6s ease',
            }} />
          </div>
          {subtitle && (
            <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '6px', display: 'block' }}>
              {subtitle}
            </span>
          )}
        </div>
      ) : subtitle ? (
        <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
          {subtitle}
        </span>
      ) : null}
    </div>
  );
};
