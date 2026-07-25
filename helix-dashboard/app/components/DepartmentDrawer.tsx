'use client';

import React from 'react';
import { DepartmentDrift, TelemetrySignal, StrategicBaseline } from '../data/mockData';

interface DepartmentDrawerProps {
  department: DepartmentDrift | null;
  onClose: () => void;
  telemetries: TelemetrySignal[];
  onTriggerNudge: (deptName: string, baselineTitle: string) => void;
  baselines: StrategicBaseline[];
  onShowToast: (msg: string) => void;
}

export const DepartmentDrawer: React.FC<DepartmentDrawerProps> = ({
  department,
  onClose,
  telemetries,
  onTriggerNudge,
  baselines,
  onShowToast,
}) => {
  if (!department) return null;

  const deptTelemetries = telemetries.filter((t) => {
    const deptName = department.name.toLowerCase();
    const sigDept = t.department.toLowerCase();
    return deptName === sigDept ||
           deptName.includes(sigDept) ||
           sigDept.includes(deptName) ||
           (deptName.includes('legal') && sigDept.includes('legal'));
  });

  const primarySignal = deptTelemetries.find(t => t.severity === 'High') || deptTelemetries[0];
  
  const matchedBaseline = primarySignal 
    ? baselines.find(b => b.title === primarySignal.matchedBaselineTitle || b.id === primarySignal.matchedBaselineId)
    : null;

  const getStatusColor = (status: DepartmentDrift['status']) => {
    switch (status) {
      case 'aligned': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'severe': return '#EF4444';
    }
  };

  const statusHex = getStatusColor(department.status);

  // Generate SVG path for 7-day trend graph
  const renderTrendChart = () => {
    const data = department.trendHistory;
    const width = 340;
    const height = 90;
    const padding = 15;
    const pointsCount = data.length;

    const minVal = Math.min(...data, 0);
    const maxVal = Math.max(...data, 1);

    const points = data.map((val, idx) => {
      const x = padding + (idx / (pointsCount - 1)) * (width - padding * 2);
      const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);
      return { x, y, val };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`trendGrad-${department.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={statusHex} stopOpacity="0.4" />
            <stop offset="100%" stopColor={statusHex} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path d={areaD} fill={`url(#trendGrad-${department.id})`} />
        {/* Path line */}
        <path d={pathD} fill="none" stroke={statusHex} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#0B0F17" stroke={statusHex} strokeWidth="2" />
        ))}
      </svg>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      <div className="drawer-enter" style={{
        width: '460px',
        maxWidth: '90vw',
        height: '100%',
        backgroundColor: '#111622',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0E131F',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818CF8' }}>
                {department.code}
              </span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                {department.name} Inspector
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px', display: 'block' }}>
              Lead: {department.lead}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Key Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(22, 27, 38, 0.7)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase' }}>Drift Index</span>
              <div style={{ fontSize: '22px', fontWeight: 700, color: statusHex, marginTop: '4px' }}>
                {department.driftScore.toFixed(2)}
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(22, 27, 38, 0.7)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase' }}>Cohesion Index</span>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>
                {department.cohesionIndex}%
              </div>
            </div>
          </div>

          {/* Interactive Nudge & Policy Section */}
          {primarySignal && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>🚨</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Active Strategic Variance
                </span>
              </div>

              {/* Telemetry Raw Stream */}
              <div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  Telemetry Raw Stream
                </span>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '11.5px',
                  color: '#E5E7EB',
                  backgroundColor: '#090D15',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap',
                }}>
                  {primarySignal.fullRawMessage}
                </div>
              </div>

              {/* Enterprise Policy Violated */}
              <div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  Enterprise Policy Violated
                </span>
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#818CF8', marginBottom: '4px' }}>
                    {matchedBaseline ? `${matchedBaseline.code}: ${matchedBaseline.title}` : primarySignal.matchedBaselineTitle}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', lineHeight: '1.4' }}>
                    {matchedBaseline ? matchedBaseline.description : 'Standard baseline parameters exceeded.'}
                  </div>
                </div>
              </div>

              {/* One-Click Nudge Action */}
              <div>
                <button
                  onClick={() => {
                    const leadName = department.lead.split(' (')[0];
                    onTriggerNudge(department.name, `⚠️ Automated Nudge sent to ${leadName}: Policy violation detected.`);
                    onShowToast(`✅ Slack Nudge Sent via Webhook`);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Send Slack Nudge to {department.lead.split(' (')[0]}
                </button>
              </div>
            </div>
          )}

          {/* 7-Day Trend Chart */}
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(22, 27, 38, 0.8)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#E5E7EB' }}>7-Day Drift Trajectory</span>
              <span style={{ fontSize: '10px', color: '#6B7280' }}>Daily Sampling</span>
            </div>
            {renderTrendChart()}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6B7280', marginTop: '8px' }}>
              <span>Day -7</span>
              <span>Day -4</span>
              <span>Today</span>
            </div>
          </div>

          {/* Top Drifting Sub-Topic Card */}
          <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: `${statusHex}12`, border: `1px solid ${statusHex}33` }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: statusHex, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Primary Behavioral Drift Topic
            </span>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#F3F4F6', fontWeight: 500 }}>
              {department.topDriftTopic}
            </p>
          </div>

          {/* Flagged Telemetry Stream List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                Recent Flagged Telemetry ({deptTelemetries.length})
              </h4>
              <span style={{ fontSize: '11px', color: '#6B7280' }}>Live Ingest</span>
            </div>

            {deptTelemetries.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '12px' }}>
                No active severe telemetry flags for this unit.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {deptTelemetries.map((signal) => (
                  <div key={signal.id} style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(22, 27, 38, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC' }}>
                          {signal.source}
                        </span>
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{signal.timestamp}</span>
                      </div>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: signal.severity === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: signal.severity === 'High' ? '#EF4444' : '#F59E0B',
                      }}>
                        Drift {signal.driftScore.toFixed(2)}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '12px', color: '#D1D5DB', fontWeight: 400, lineHeight: '1.4' }}>
                      {signal.payloadPreview}
                    </p>

                    <div style={{ marginTop: '8px', fontSize: '10px', color: '#6B7280' }}>
                      Matched Baseline: <span style={{ color: '#818CF8' }}>{signal.matchedBaselineTitle}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0E131F',
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={() => onTriggerNudge(department.name, department.topDriftTopic)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: '#6366F1',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Trigger Nudge Intervention
          </button>
        </div>
      </div>
    </div>
  );
};
