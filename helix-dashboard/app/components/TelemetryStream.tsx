'use client';

import React, { useState } from 'react';
import { TelemetrySignal } from '../data/mockData';

interface TelemetryStreamProps {
  signals: TelemetrySignal[];
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onSimulateSignal: () => void;
  onTriggerNudge?: (deptName: string, baselineTitle: string) => void;
  onShowToast?: (msg: string) => void;
}

export const TelemetryStream: React.FC<TelemetryStreamProps> = ({
  signals,
  isStreaming,
  onToggleStreaming,
  onSimulateSignal,
}) => {
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(signals[0]?.id || null);

  const filteredSignals = signals.filter((s) => {
    if (selectedSource !== 'All' && s.source !== selectedSource) return false;
    if (selectedSeverity !== 'All' && s.severity !== selectedSeverity) return false;
    if (selectedDept !== 'All' && s.department !== selectedDept) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.payloadPreview.toLowerCase().includes(q) ||
        s.fullRawMessage.toLowerCase().includes(q) ||
        s.matchedBaselineTitle.toLowerCase().includes(q) ||
        s.sender.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'High':
        return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'Med':
        return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
      default:
        return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' };
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Slack':
        return (
          <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(224, 30, 90, 0.15)', color: '#EC4899', fontSize: '10px', fontWeight: 700 }}>
            Slack
          </span>
        );
      case 'Teams':
        return (
          <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(98, 100, 167, 0.2)', color: '#A5B4FC', fontSize: '10px', fontWeight: 700 }}>
            Teams
          </span>
        );
      case 'Jira':
        return (
          <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(0, 82, 204, 0.2)', color: '#60A5FA', fontSize: '10px', fontWeight: 700 }}>
            Jira
          </span>
        );
      case 'Confluence':
        return (
          <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(38, 132, 255, 0.2)', color: '#38BDF8', fontSize: '10px', fontWeight: 700 }}>
            Confluence
          </span>
        );
      default:
        return <span style={{ fontSize: '10px', fontWeight: 700 }}>{source}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="live-pulse" style={{ backgroundColor: '#10B981', width: '10px', height: '10px' }} />
            Live Telemetry Stream
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9CA3AF' }}>
            Real-time ingestion feed & divergence evaluation engine
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onSimulateSignal}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#A5B4FC',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ⚡ Inject Telemetry Signal
          </button>

          <button
            onClick={onToggleStreaming}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: isStreaming ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              border: `1px solid ${isStreaming ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
              color: isStreaming ? '#34D399' : '#FBBF24',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="live-pulse" style={{ backgroundColor: isStreaming ? '#10B981' : '#F59E0B' }} />
            {isStreaming ? 'Streaming Live' : 'Stream Paused'}
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
          <input
            type="text"
            placeholder="Filter by raw text, baseline, or sender..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: '6px',
              backgroundColor: '#0E131F',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontSize: '12px',
              outline: 'none',
            }}
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '10px' }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Source Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Source:</span>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: '#0E131F',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="All">All Sources</option>
            <option value="Slack">Slack</option>
            <option value="Teams">Teams</option>
            <option value="Jira">Jira</option>
            <option value="Confluence">Confluence</option>
          </select>
        </div>

        {/* Severity Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Severity:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: '#0E131F',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="All">All Severities</option>
            <option value="High">High Drift</option>
            <option value="Med">Med Drift</option>
            <option value="Low">Low Drift</option>
          </select>
        </div>

        {/* Department Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: '#0E131F',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Legal & Risk">Legal & Risk</option>
          </select>
        </div>
      </div>

      {/* Main Stream Table */}
      <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0E131F',
          display: 'grid',
          gridTemplateColumns: '80px 100px 120px 1fr 180px 100px 90px',
          gap: '12px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          <div>Timestamp</div>
          <div>Source</div>
          <div>Department</div>
          <div>Payload Preview</div>
          <div>Matched Baseline</div>
          <div>Drift Score</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredSignals.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
              No telemetry signals match the active filters.
            </div>
          ) : (
            filteredSignals.map((signal) => {
              const isExpanded = expandedSignalId === signal.id;
              const severityStyle = getSeverityStyle(signal.severity);

              return (
                <React.Fragment key={signal.id}>
                  <div
                    onClick={() => setExpandedSignalId(isExpanded ? null : signal.id)}
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      display: 'grid',
                      gridTemplateColumns: '80px 100px 120px 1fr 180px 100px 90px',
                      gap: '12px',
                      alignItems: 'center',
                      fontSize: '12px',
                      cursor: 'pointer',
                      backgroundColor: isExpanded ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <div style={{ color: '#9CA3AF', fontFamily: 'monospace', fontSize: '11px' }}>
                      {signal.timestamp}
                    </div>

                    <div>{getSourceIcon(signal.source)}</div>

                    <div style={{ color: '#E5E7EB', fontWeight: 500 }}>
                      {signal.department}
                    </div>

                    <div style={{ color: '#D1D5DB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {signal.payloadPreview}
                    </div>

                    <div style={{ color: '#818CF8', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {signal.matchedBaselineTitle}
                    </div>

                    <div>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: severityStyle.bg,
                        color: severityStyle.color,
                        border: `1px solid ${severityStyle.border}`,
                        display: 'inline-block',
                      }}>
                        {signal.driftScore.toFixed(2)} ({signal.severity})
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <button style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#9CA3AF',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}>
                        {isExpanded ? 'Collapse' : 'Detail'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Row Detail - Side by Side LLM Divergence Inspector */}
                  {isExpanded && (
                    <div style={{
                      padding: '20px 24px',
                      backgroundColor: '#090C13',
                      borderBottom: '1px solid rgba(99, 102, 241, 0.3)',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                    }}>
                      {/* Left: Raw Signal Payload */}
                      <div style={{
                        padding: '16px',
                        borderRadius: '8px',
                        backgroundColor: '#111622',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>
                            Raw Message Payload ({signal.channelOrTicket})
                          </span>
                          <span style={{ fontSize: '10px', color: '#6B7280', fontFamily: 'monospace' }}>
                            Sender: {signal.sender}
                          </span>
                        </div>
                        <p style={{
                          margin: 0,
                          fontSize: '12px',
                          color: '#E5E7EB',
                          lineHeight: '1.5',
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          backgroundColor: '#090D15',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}>
                          {signal.fullRawMessage}
                        </p>

                        <div style={{ marginTop: '12px' }}>
                          <span style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase' }}>Parsed Metadata JSON</span>
                          <pre className="mono" style={{
                            margin: '4px 0 0 0',
                            fontSize: '11px',
                            color: '#34D399',
                            backgroundColor: '#06090F',
                            padding: '10px',
                            borderRadius: '6px',
                            maxHeight: '120px',
                            overflowY: 'auto',
                          }}>
                            {JSON.stringify(signal.rawJson, null, 2)}
                          </pre>
                        </div>
                      </div>

                      {/* Right: LLM Divergence Evaluation & Baseline Match */}
                      <div style={{
                        padding: '16px',
                        borderRadius: '8px',
                        backgroundColor: '#111622',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#818CF8', textTransform: 'uppercase' }}>
                              Matched Strategic Policy Baseline
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: severityStyle.color }}>
                              Drift Score: {signal.driftScore.toFixed(2)}
                            </span>
                          </div>

                          <div style={{
                            padding: '10px 12px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#FFFFFF',
                            marginBottom: '12px',
                          }}>
                            {signal.matchedBaselineTitle}
                          </div>

                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>
                            LLM Cognitive Divergence Reasoning
                          </span>
                          <p style={{
                            margin: '6px 0 0 0',
                            fontSize: '12px',
                            color: '#D1D5DB',
                            lineHeight: '1.5',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            borderLeft: `3px solid ${severityStyle.color}`,
                            padding: '10px 12px',
                            borderRadius: '0 6px 6px 0',
                          }}>
                            {signal.llmReasoning}
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                          <button
                            onClick={() => {
                              if (onTriggerNudge && onShowToast) {
                                onTriggerNudge(signal.department, `⚠️ Automated Nudge sent to sender: Policy violation detected.`);
                                onShowToast(`✅ Slack Nudge Sent via Webhook`);
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#6366F1',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Dispatch Nudge Intervention
                          </button>
                          <button style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#9CA3AF',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}>
                            Dismiss Signal
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
