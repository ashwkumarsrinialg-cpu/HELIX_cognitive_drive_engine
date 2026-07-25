'use client';

import React, { useState, useEffect } from 'react';
import { useWidgetSDK, useWidgetState } from '@nitrostack/widgets';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_STREAM_SIGNALS,
  INITIAL_BASELINES,
  INITIAL_INTERVENTIONS,
  DepartmentDrift,
  TelemetrySignal,
  StrategicBaseline,
  InterventionLog,
} from '../data/mockData';
import { Sidebar } from './Sidebar';
import { MetricCard } from './MetricCard';
import { HeatmapMatrix } from './HeatmapMatrix';
import { DepartmentDrawer } from './DepartmentDrawer';
import { TelemetryStream } from './TelemetryStream';
import { GenomeStudio } from './GenomeStudio';
import { InterventionHub } from './InterventionHub';

type ViewType = 'dashboard' | 'stream' | 'genome' | 'interventions';

interface HelixAppState extends Record<string, any> {
  currentView: ViewType;
  selectedDeptId: string | null;
  isStreaming: boolean;
}

export default function HelixApp({ initialView = 'dashboard' }: { initialView?: ViewType }) {
  const { getToolOutput } = useWidgetSDK();
  const [widgetState, setWidgetState] = useWidgetState<HelixAppState>(() => ({
    currentView: initialView,
    selectedDeptId: null,
    isStreaming: true,
  }));

  const currentView = widgetState?.currentView || initialView;

  // Local Reactive State Initialized with Mock Data
  const [departments, setDepartments] = useState<DepartmentDrift[]>(INITIAL_DEPARTMENTS);
  const [signals, setSignals] = useState<TelemetrySignal[]>(INITIAL_STREAM_SIGNALS);
  const [baselines, setBaselines] = useState<StrategicBaseline[]>(INITIAL_BASELINES);
  const [interventions, setInterventions] = useState<InterventionLog[]>(INITIAL_INTERVENTIONS);
  const [inspectedDept, setInspectedDept] = useState<DepartmentDrift | null>(null);

  // Sync tool output if passed from MCP tool
  const toolData = getToolOutput<any>();
  useEffect(() => {
    if (toolData?.departments) {
      setDepartments(toolData.departments);
    }
    if (toolData?.telemetries) {
      setSignals(toolData.telemetries);
    }
  }, [toolData]);

  // Live Stream Simulation Interval
  useEffect(() => {
    if (!widgetState?.isStreaming) return;

    const interval = setInterval(() => {
      // Simulate slight drift updates or new signals
      setDepartments((prevDepts) =>
        prevDepts.map((dept) => {
          const delta = (Math.random() * 0.04 - 0.02);
          const newDrift = Math.max(0.05, Math.min(0.95, dept.driftScore + delta));
          const roundedDrift = Math.round(newDrift * 100) / 100;
          const status = roundedDrift > 0.6 ? 'severe' : roundedDrift > 0.3 ? 'moderate' : 'aligned';

          const newHistory = [...dept.trendHistory.slice(1), roundedDrift];
          return {
            ...dept,
            driftScore: roundedDrift,
            status,
            trendHistory: newHistory,
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [widgetState?.isStreaming]);

  // View Switcher Handler
  const handleNavigate = (view: ViewType) => {
    setWidgetState({ ...widgetState, currentView: view });
  };

  // Inspect Department Drawer Trigger
  const handleInspectDepartment = (dept: DepartmentDrift) => {
    setInspectedDept(dept);
    setWidgetState({ ...widgetState, selectedDeptId: dept.id });
  };

  // Inject New Signal Simulator
  const handleSimulateSignal = () => {
    const randomDepts: Array<TelemetrySignal['department']> = ['Engineering', 'Product', 'Sales', 'Legal', 'Marketing'];
    const randomSources: Array<TelemetrySignal['source']> = ['Slack', 'Teams', 'Jira', 'Confluence'];
    const randomSeverities: Array<TelemetrySignal['severity']> = ['High', 'Med', 'Low'];

    const chosenDept = randomDepts[Math.floor(Math.random() * randomDepts.length)];
    const chosenSource = randomSources[Math.floor(Math.random() * randomSources.length)];
    const chosenSev = randomSeverities[Math.floor(Math.random() * randomSeverities.length)];

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newSignal: TelemetrySignal = {
      id: `sig-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      source: chosenSource,
      department: chosenDept,
      severity: chosenSev,
      payloadPreview: `${chosenSource} event in ${chosenDept}: Potential strategic variance flagged by policy engine...`,
      fullRawMessage: `${chosenSource} Live Telemetry Signal: "Automated scanner detected high variance transmission in ${chosenDept} module."`,
      matchedBaselineId: 'base-sec-01',
      matchedBaselineTitle: 'Mandatory SOC2 & Pre-Release SecOps Gateways',
      driftScore: chosenSev === 'High' ? 0.85 : chosenSev === 'Med' ? 0.45 : 0.18,
      llmReasoning: `Automated real-time cognitive scan detected departure from standard baseline parameters in ${chosenDept}.`,
      sender: `agent.${chosenDept.toLowerCase()}@helix.internal`,
      channelOrTicket: `${chosenSource} #${chosenDept.toLowerCase()}-telemetry`,
      rawJson: {
        timestamp: now.toISOString(),
        department: chosenDept,
        source: chosenSource,
        severity: chosenSev,
        variance_flag: true,
      },
    };

    setSignals((prev) => [newSignal, ...prev]);
  };

  // Trigger Nudge Action
  const handleTriggerNudge = (targetUnit: string, nudgeMsg: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newLog: InterventionLog = {
      id: `nudge-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      targetUnit,
      recipient: `${targetUnit.toLowerCase().replace(/[^a-z]/g, '')}@helix.internal`,
      baselineCode: 'SEC-01',
      baselineTitle: 'Mandatory SOC2 & Pre-Release SecOps Gateways',
      channel: 'Slack Nudge Bot',
      status: 'Delivered',
      nudgeMessage: nudgeMsg || '⚠️ Automated HELIX Guardian Nudge: Behavioral drift variance detected.',
      resolutionTime: 'Pending',
      driftDelta: -0.15,
    };

    setInterventions((prev) => [newLog, ...prev]);
  };

  // Add Strategic Baseline
  const handleAddBaseline = (newBase: Omit<StrategicBaseline, 'id' | 'createdDate'>) => {
    const baseObj: StrategicBaseline = {
      ...newBase,
      id: `base-${Date.now().toString().slice(-4)}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setBaselines((prev) => [baseObj, ...prev]);
  };

  // Executive Top Metrics Calculation
  const severeAlertsCount = departments.filter((d) => d.status === 'severe').length;
  const avgDrift = (departments.reduce((acc, d) => acc + d.driftScore, 0) / departments.length).toFixed(2);
  const highestRiskDept = [...departments].sort((a, b) => b.driftScore - a.driftScore)[0];
  const avgCohesion = (departments.reduce((acc, d) => acc + d.cohesionIndex, 0) / departments.length).toFixed(1);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0B0F17', color: '#F3F4F6' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        activeAlertsCount={severeAlertsCount}
        isStreaming={!!widgetState?.isStreaming}
        onToggleStreaming={() => setWidgetState({ ...widgetState, isStreaming: !widgetState?.isStreaming })}
        onSimulateEvent={handleSimulateSignal}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        {/* Top Header Bar */}
        <header style={{
          padding: '16px 28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0E131F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF' }}>Workspace:</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Global Enterprise Genome</span>
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34D399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}>
              Sync Active
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9CA3AF' }}>
              <span className="live-pulse" style={{ backgroundColor: '#6366F1' }} />
              <span>Telemetry Ingest: <strong style={{ color: '#E5E7EB' }}>1.4k events/min</strong></span>
            </div>

            <button
              onClick={handleSimulateSignal}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#A5B4FC',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Quick Inject Signal
            </button>
          </div>
        </header>

        {/* View Router Render Area */}
        <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
          {currentView === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Executive Header Title */}
              <div>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#FFFFFF' }}>
                  Executive Drift Heatmap
                </h1>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#9CA3AF' }}>
                  Real-time cognitive drift monitoring across enterprise business units
                </p>
              </div>

              {/* Top Row Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <MetricCard
                  title="Organizational Cohesion"
                  value={`${avgCohesion}%`}
                  subtitle="Weighted cross-departmental alignment score"
                  progressPercentage={parseFloat(avgCohesion)}
                  statusColor="emerald"
                  trendBadge={{ text: '↑ +2.1%', isPositive: true }}
                />

                <MetricCard
                  title="Active Drift Alerts"
                  value={`${departments.reduce((acc, d) => acc + d.activeAlertsCount, 0)} Alerts`}
                  subtitle={`${severeAlertsCount} critical severe drift flags`}
                  statusColor="rose"
                  trendBadge={{ text: `${severeAlertsCount} Critical`, isPositive: false }}
                />

                <MetricCard
                  title="Highest Risk Unit"
                  value={highestRiskDept?.name || 'N/A'}
                  subtitle={`Current Drift Score: ${highestRiskDept?.driftScore.toFixed(2)}`}
                  statusColor="rose"
                  trendBadge={{ text: 'High Risk', isPositive: false }}
                />

                <MetricCard
                  title="24h Intervention Success"
                  value="91.2%"
                  subtitle="41 of 45 automated nudges actioned"
                  progressPercentage={91.2}
                  statusColor="indigo"
                  trendBadge={{ text: 'Optimal', isPositive: true }}
                />
              </div>

              {/* Main Section: Departmental Heatmap Matrix */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>
                    Departmental Behavioral Drift Matrix
                  </h3>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>
                    Click "Inspect" on any tile for deep telemetry trajectory
                  </span>
                </div>

                <HeatmapMatrix
                  departments={departments}
                  onInspectDepartment={handleInspectDepartment}
                />
              </div>
            </div>
          )}

          {currentView === 'stream' && (
            <TelemetryStream
              signals={signals}
              isStreaming={!!widgetState?.isStreaming}
              onToggleStreaming={() => setWidgetState({ ...widgetState, isStreaming: !widgetState?.isStreaming })}
              onSimulateSignal={handleSimulateSignal}
            />
          )}

          {currentView === 'genome' && (
            <GenomeStudio
              baselines={baselines}
              onAddBaseline={handleAddBaseline}
            />
          )}

          {currentView === 'interventions' && (
            <InterventionHub
              interventions={interventions}
              onDispatchNudge={handleTriggerNudge}
            />
          )}
        </main>
      </div>

      {/* Department Inspector Slide-Over Drawer */}
      <DepartmentDrawer
        department={inspectedDept}
        onClose={() => {
          setInspectedDept(null);
          setWidgetState({ ...widgetState, selectedDeptId: null });
        }}
        telemetries={signals}
        onTriggerNudge={handleTriggerNudge}
      />
    </div>
  );
}
