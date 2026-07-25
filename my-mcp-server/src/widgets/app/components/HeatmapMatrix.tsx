'use client';

import React from 'react';
import { DepartmentDrift } from '../data/mockData';

interface HeatmapMatrixProps {
  departments: DepartmentDrift[];
  onInspectDepartment: (dept: DepartmentDrift) => void;
}

export const HeatmapMatrix: React.FC<HeatmapMatrixProps> = ({
  departments,
  onInspectDepartment,
}) => {
  const getStatusBadge = (status: DepartmentDrift['status']) => {
    switch (status) {
      case 'aligned':
        return { label: 'ALIGNED', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'moderate':
        return { label: 'MODERATE DRIFT', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'severe':
        return { label: 'SEVERE DRIFT', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' };
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
      {departments.map((dept) => {
        const badge = getStatusBadge(dept.status);
        const driftPercentage = Math.round(dept.driftScore * 100);

        return (
          <div
            key={dept.id}
            className="glass-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
            }}
          >
            {/* Top row with name and badge */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '11px',
                    color: '#818CF8',
                  }}>
                    {dept.code}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>{dept.name}</h4>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>Lead: {dept.lead}</span>
                  </div>
                </div>

                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  backgroundColor: badge.bg,
                  color: badge.color,
                  border: `1px solid ${badge.border}`,
                  letterSpacing: '0.4px',
                }}>
                  {badge.label}
                </span>
              </div>

              {/* Drift Score Meter & Percentage */}
              <div style={{
                margin: '14px 0',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(11, 15, 23, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>Current Drift Index</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: badge.color }}>
                    {dept.driftScore.toFixed(2)} <span style={{ fontSize: '11px', color: '#6B7280' }}>({driftPercentage}%)</span>
                  </span>
                </div>

                {/* Progress track */}
                <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${driftPercentage}%`,
                    backgroundColor: badge.color,
                    boxShadow: `0 0 10px ${badge.color}`,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>

              {/* Top Drifting Sub-Topic */}
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Top Drifting Sub-Topic
                </span>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  color: '#D1D5DB',
                  fontWeight: 500,
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  "{dept.topDriftTopic}"
                </p>
              </div>
            </div>

            {/* Bottom Row Footer & Inspect Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  <strong style={{ color: '#E5E7EB' }}>{dept.activeAlertsCount}</strong> alerts
                </span>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  <strong style={{ color: '#E5E7EB' }}>{dept.cohesionIndex}%</strong> cohesion
                </span>
              </div>

              <button
                onClick={() => onInspectDepartment(dept)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#A5B4FC',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                }}
              >
                Inspect
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
