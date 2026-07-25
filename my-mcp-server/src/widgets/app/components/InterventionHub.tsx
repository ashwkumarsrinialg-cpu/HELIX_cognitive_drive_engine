'use client';

import React, { useState } from 'react';
import { InterventionLog } from '../data/mockData';

interface InterventionHubProps {
  interventions: InterventionLog[];
  onDispatchNudge: (target: string, message: string) => void;
}

export const InterventionHub: React.FC<InterventionHubProps> = ({
  interventions,
  onDispatchNudge,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [targetUnit, setTargetUnit] = useState<string>('Engineering - SecOps Lead');
  const [nudgeMessage, setNudgeMessage] = useState<string>('');

  const filteredInterventions = interventions.filter(
    (item) => statusFilter === 'All' || item.status === statusFilter
  );

  const getStatusBadge = (status: InterventionLog['status']) => {
    switch (status) {
      case 'Delivered':
        return { color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.15)', border: 'rgba(96, 165, 250, 0.3)' };
      case 'Acknowledged':
        return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'Actioned':
        return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'Escalated':
        return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nudgeMessage) return;

    onDispatchNudge(targetUnit, nudgeMessage);
    setNudgeMessage('');
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
            Nudge & Intervention Hub
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9CA3AF' }}>
            Automated cognitive intervention logs & executive resolution pipeline
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            backgroundColor: '#6366F1',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Dispatch Direct Nudge
        </button>
      </div>

      {/* Top Intervention Performance Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase' }}>24h Total Nudges</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
            45 Dispatches
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase' }}>Intervention Success Rate</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>
            91.2% <span style={{ fontSize: '11px', color: '#9CA3AF' }}>(41 Actioned)</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase' }}>Mean Resolution Time</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#818CF8', marginTop: '4px' }}>
            1.4 Hours
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase' }}>Active Escalations</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#EF4444', marginTop: '4px' }}>
            1 Board Level
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF', marginRight: '6px' }}>Status Filter:</span>
          {['All', 'Delivered', 'Acknowledged', 'Actioned', 'Escalated'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: statusFilter === st ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                backgroundColor: statusFilter === st ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: statusFilter === st ? '#FFFFFF' : '#9CA3AF',
                fontSize: '12px',
                fontWeight: statusFilter === st ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '11px', color: '#6B7280' }}>
          Showing {filteredInterventions.length} log entry records
        </span>
      </div>

      {/* Action Logs Feed Table */}
      <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0E131F',
          display: 'grid',
          gridTemplateColumns: '80px 180px 100px 1fr 120px 110px',
          gap: '12px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          <div>Timestamp</div>
          <div>Target Unit / Lead</div>
          <div>Channel</div>
          <div>Nudge Message Content</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Resolution</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredInterventions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
              No intervention logs match the active filter.
            </div>
          ) : (
            filteredInterventions.map((item) => {
              const badge = getStatusBadge(item.status);

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    display: 'grid',
                    gridTemplateColumns: '80px 180px 100px 1fr 120px 110px',
                    gap: '12px',
                    alignItems: 'center',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ color: '#9CA3AF', fontFamily: 'monospace', fontSize: '11px' }}>
                    {item.timestamp}
                  </div>

                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 600 }}>{item.targetUnit}</div>
                    <div style={{ fontSize: '10px', color: '#6B7280' }}>Baseline: {item.baselineCode}</div>
                  </div>

                  <div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#D1D5DB',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                      {item.channel}
                    </span>
                  </div>

                  <div style={{ color: '#D1D5DB', lineHeight: '1.4' }}>
                    {item.nudgeMessage}
                  </div>

                  <div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      backgroundColor: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                    }}>
                      {item.status}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '11px', color: '#9CA3AF' }}>
                    {item.resolutionTime}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Dispatch Nudge Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '460px',
            maxWidth: '90vw',
            backgroundColor: '#161B26',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                Dispatch Direct Nudge Intervention
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
                  Target Department / Unit Lead
                </label>
                <select
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E131F',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    marginTop: '4px',
                    outline: 'none',
                  }}
                >
                  <option value="Engineering - Marcus Vance">Engineering - Marcus Vance</option>
                  <option value="Product - Elena Rostova">Product - Elena Rostova</option>
                  <option value="Legal - David Chen">Legal - David Chen</option>
                  <option value="Sales - Sarah Jenkins">Sales - Sarah Jenkins</option>
                  <option value="Marketing - Amara Okafor">Marketing - Amara Okafor</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
                  Intervention Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter policy reminder or correction guidance to send via automated bot..."
                  value={nudgeMessage}
                  onChange={(e) => setNudgeMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E131F',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    marginTop: '4px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#9CA3AF',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 16px',
                    borderRadius: '6px',
                    backgroundColor: '#6366F1',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                  }}
                >
                  Dispatch Nudge Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
