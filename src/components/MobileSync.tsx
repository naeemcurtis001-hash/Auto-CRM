/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Link2,
  RefreshCw,
  Activity,
  Cpu,
  MessageSquare,
  Clock,
  Sparkles,
  Send,
  Sliders,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  History,
  Coins
} from "lucide-react";
import { IntegrationItem, WebhookLog, KanbanCard } from "../types";

interface MobileSyncProps {
  integrations: IntegrationItem[];
  webhookLogs: WebhookLog[];
  onToggleIntegration: (id: string) => void;
  onSyncNow: (id: string) => void;
  kanbanCards: KanbanCard[];
  onSimulateOutreach: (customer: string, text: string, flow: string) => void;
}

export default function MobileSync({
  integrations,
  webhookLogs,
  onToggleIntegration,
  onSyncNow,
  kanbanCards,
  onSimulateOutreach,
}: MobileSyncProps) {
  // Toggle between Webhook Matrix and Automated Outreach Flows
  const [activeSubTab, setActiveSubTab] = useState<"workflows" | "connections">("workflows");

  // Rotate/loading tracker for Sync actions
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // --- Campaign 1 State (Estimate Recovery) ---
  const [flow1Active, setFlow1Active] = useState(true);
  const [flow1Delay, setFlow1Delay] = useState("2 Hours");
  const [flow1Template, setFlow1Template] = useState(
    "Hi {Customer}, your digital repair quote for the {Vehicle} is ready for review. Approve and authorize repairs here to secure your bay: https://autoconnect.io/portal/Sarah"
  );

  // --- Campaign 2 State (Dormant Recall) ---
  const [flow2Active, setFlow2Active] = useState(true);
  const [flow2Offer, setFlow2Offer] = useState("$50 Off Repair Order");
  const [flow2Template, setFlow2Template] = useState(
    "Hi {Customer}, we haven't seen you since your last {Service} check-in on the {Vehicle}. Schedule repairs this week & get {Offer}! Book here: https://autoconnect.io/recall"
  );

  const handleSyncClick = (softwareName: string) => {
    setSyncingId(softwareName);
    onSyncNow(softwareName);
    setTimeout(() => {
      setSyncingId(null);
    }, 1200);
  };

  // Helper to format templates
  const formatMessage = (
    template: string,
    customer: string,
    vehicle: string,
    service: string,
    offer?: string
  ) => {
    let text = template
      .replace(/{Customer}/g, customer)
      .replace(/{Vehicle}/g, vehicle)
      .replace(/{Service}/g, service);
    if (offer) {
      text = text.replace(/{Offer}/g, offer);
    }
    return text;
  };

  // 1. Target customers with unpaid quotes (Awaiting columnId = 1, or Declined columnId = 2)
  const pendingPaymentTargets = kanbanCards.filter(
    (c) => c.columnId === 1 || c.columnId === 2
  );

  // 2. Dormant customers who came in/declined but haven't returned to get actual work done (Declined columnId = 2)
  const dormantRecallTargets = kanbanCards.filter((c) => c.columnId === 2);

  return (
    <div className="space-y-5 px-4 pb-16 text-left">
      
      {/* 1. Header Information */}
      <div>
        <span className="text-[10px] font-mono tracking-wider text-gray-400 uppercase font-bold">
          Communications Command
        </span>
        <h2 className="text-sm font-display font-bold text-gray-950">
          Automations & Sync Center
        </h2>
      </div>

      {/* 2. Sub-tab Selector */}
      <div className="bg-gray-150 p-1 rounded-2xl flex border border-gray-200">
        <button
          onClick={() => setActiveSubTab("workflows")}
          className={`flex-1 py-2 text-center rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 min-h-[36px] cursor-pointer ${
            activeSubTab === "workflows"
              ? "bg-white text-gray-950 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <MessageSquare size={13} className="text-[#059669]" />
            <span>Messaging Flows</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSubTab("connections")}
          className={`flex-1 py-2 text-center rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 min-h-[36px] cursor-pointer ${
            activeSubTab === "connections"
              ? "bg-white text-gray-950 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Cpu size={13} className="text-blue-500" />
            <span>Webhook Connections</span>
          </div>
        </button>
      </div>

      {/* --- RENDER 1: AUTOMATED outreach WORKFLOWS --- */}
      {activeSubTab === "workflows" && (
        <div className="space-y-6">
          
          {/* FLOW A: Payment & Quote Approval Reminder */}
          <div className="bg-white rounded-2xl p-4.5 border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.015)] space-y-4">
            
            {/* Flow Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-widest block bg-amber-50 px-2 py-0.5 rounded border border-amber-100 w-fit">
                  Workflow A
                </span>
                <h3 className="text-xs font-display font-extrabold text-gray-900 mt-1">
                  Unapproved Estimate Recovery
                </h3>
                <p className="text-[10.5px] text-gray-500 leading-normal">
                  Auto-sends custom reminders to clients who received quotes but haven't approved or paid.
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => setFlow1Active(!flow1Active)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-150 focus:outline-none shrink-0 cursor-pointer min-h-[24px] ${
                  flow1Active ? "bg-[#059669]" : "bg-gray-200"
                }`}
              >
                <div
                  className={`bg-white w-4.5 h-4.5 rounded-full shadow transform transition-transform duration-150 ${
                    flow1Active ? "translate-x-4.5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Campaign Rules & State Fields */}
            {flow1Active && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-3.5 border border-gray-150">
                
                {/* Trigger options */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-550 font-bold flex items-center gap-1">
                    <Clock size={11} className="text-amber-500" />
                    Trigger Interval:
                  </span>
                  <select
                    value={flow1Delay}
                    onChange={(e) => setFlow1Delay(e.target.value)}
                    className="text-[10px] font-mono bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none text-gray-800 font-bold"
                  >
                    <option value="2 Hours">2 Hours Idle</option>
                    <option value="12 Hours">12 Hours Idle</option>
                    <option value="24 Hours">24 Hours Overdue</option>
                    <option value="48 Hours">48 Hours Overdue</option>
                  </select>
                </div>

                {/* Template text area */}
                <div className="space-y-1">
                  <span className="text-[9.5px] font-mono text-gray-400 block uppercase font-bold">
                    Text Message (SMS) Template
                  </span>
                  <textarea
                    value={flow1Template}
                    onChange={(e) => setFlow1Template(e.target.value)}
                    rows={3}
                    className="w-full text-[10.5px] font-sans text-gray-850 p-2 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 leading-tight resize-none"
                    placeholder="Enter SMS template. Use tokens {Customer}, {Vehicle}, {Price}..."
                  />
                  <div className="text-[8.5px] font-mono text-gray-400 flex justify-between">
                    <span>Dynamic Tokens: &#123;Customer&#125;, &#123;Vehicle&#125;, &#123;Price&#125;</span>
                    <span className="text-emerald-600 font-bold">SMS Active</span>
                  </div>
                </div>

                {/* Active Pending Targets list */}
                <div className="space-y-1.5 border-t border-gray-200/60 pt-2.5">
                  <span className="text-[9.5px] font-mono text-gray-550 font-bold block uppercase tracking-wide">
                    Eligible Customer Pipeline ({pendingPaymentTargets.length})
                  </span>
                  
                  {pendingPaymentTargets.length === 0 ? (
                    <div className="text-center text-[10px] text-gray-400 py-2">
                      No matching clients waiting in Awaiting or Declined state.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-none pr-1">
                      {pendingPaymentTargets.map((c) => {
                        const formattedText = formatMessage(
                          flow1Template,
                          c.customerName,
                          c.yearMakeModel,
                          c.serviceNeeded
                        ).replace(/{Price}/g, `$${c.price.toLocaleString()}`);

                        return (
                          <div
                            key={c.id}
                            className="bg-white rounded-xl p-2.5 border border-gray-200 flex justify-between items-center gap-2 shadow-sm"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-gray-900 block leading-tight truncate">
                                {c.customerName}
                              </span>
                              <span className="text-[9px] font-mono text-gray-400 block leading-none truncate mt-0.5">
                                {c.yearMakeModel} • ${c.price}
                              </span>
                            </div>
                            
                            {/* Simulate Send Button */}
                            <button
                              onClick={() =>
                                onSimulateOutreach(
                                  c.customerName,
                                  formattedText,
                                  "Quote Recovery Active Flow"
                                )
                              }
                              className="text-[9px] font-mono bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded px-2.5 py-1 flex items-center gap-1 cursor-pointer transition-colors font-bold shrink-0 min-h-[26px]"
                            >
                              <Send size={9} />
                              <span>Simulate SMS</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* FLOW B: Dormant / Lost Lead Recall */}
          <div className="bg-white rounded-2xl p-4.5 border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.015)] space-y-4">
            
            {/* Flow Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest block bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit">
                  Workflow B
                </span>
                <h3 className="text-xs font-display font-extrabold text-gray-900 mt-1">
                  Dormant Customer Recall
                </h3>
                <p className="text-[10.5px] text-gray-500 leading-normal">
                  Targets clients who left diagnostic/inspections incomplete without scheduling recommended follow-up repairs.
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => setFlow2Active(!flow2Active)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-150 focus:outline-none shrink-0 cursor-pointer min-h-[24px] ${
                  flow2Active ? "bg-[#059669]" : "bg-gray-200"
                }`}
              >
                <div
                  className={`bg-white w-4.5 h-4.5 rounded-full shadow transform transition-transform duration-150 ${
                    flow2Active ? "translate-x-4.5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Campaign Rules & State Fields */}
            {flow2Active && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-3.5 border border-gray-150">
                
                {/* Offer configurations */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-550 font-bold flex items-center gap-1">
                    <Coins size={11} className="text-emerald-500" />
                    Incentive Offer:
                  </span>
                  <select
                    value={flow2Offer}
                    onChange={(e) => setFlow2Offer(e.target.value)}
                    className="text-[10px] font-mono bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none text-gray-800 font-bold"
                  >
                    <option value="$25 Off Service Coupon">$25 Off Shop Coupon</option>
                    <option value="$50 Off Repair Order">$50 Off Repair Order</option>
                    <option value="10% Off All Recommended Repairs">10% Off Recommendations</option>
                    <option value="Free Multi-point Inspection Check">Free Visual Upgrade</option>
                  </select>
                </div>

                {/* Template text area */}
                <div className="space-y-1">
                  <span className="text-[9.5px] font-mono text-gray-400 block uppercase font-bold">
                    Recall SMS Template
                  </span>
                  <textarea
                    value={flow2Template}
                    onChange={(e) => setFlow2Template(e.target.value)}
                    rows={3}
                    className="w-full text-[10.5px] font-sans text-gray-850 p-2 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 leading-tight resize-none"
                    placeholder="Enter Recall SMS. Use tokens {Customer}, {Vehicle}, {Service}, {Offer}..."
                  />
                  <div className="text-[8.5px] font-mono text-gray-400 flex justify-between">
                    <span>Tokens: &#123;Customer&#125;, &#123;Vehicle&#125;, &#123;Service&#125;, &#123;Offer&#125;</span>
                    <span className="text-emerald-600 font-bold">SMS Active</span>
                  </div>
                </div>

                {/* Active Pending Recall Targets */}
                <div className="space-y-1.5 border-t border-gray-200/60 pt-2.5">
                  <span className="text-[9.5px] font-mono text-gray-550 font-bold block uppercase tracking-wide">
                    Inactive Recall Opportunities ({dormantRecallTargets.length})
                  </span>
                  
                  {dormantRecallTargets.length === 0 ? (
                    <div className="text-center text-[10px] text-gray-400 py-2">
                      Move check-ins into "Declined" to simulate a dormant candidate.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-none pr-1">
                      {dormantRecallTargets.map((c) => {
                        const formattedText = formatMessage(
                          flow2Template,
                          c.customerName,
                          c.yearMakeModel,
                          c.serviceNeeded,
                          flow2Offer
                        );

                        return (
                          <div
                            key={c.id}
                            className="bg-white rounded-xl p-2.5 border border-gray-200 flex justify-between items-center gap-2 shadow-sm"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-gray-900 block leading-tight truncate">
                                {c.customerName}
                              </span>
                              <span className="text-[9px] font-mono text-rose-500 block leading-none truncate mt-0.5 font-semibold">
                                Declined • {c.elapsed}
                              </span>
                            </div>
                            
                            {/* Simulate Send Button */}
                            <button
                              onClick={() =>
                                onSimulateOutreach(
                                  c.customerName,
                                  formattedText,
                                  "Dormant Lead Recall Campaign"
                                )
                              }
                              className="text-[9px] font-mono bg-emerald-50 hover:bg-emerald-100 text-[#059669] border border-emerald-200 rounded px-2.5 py-1 flex items-center gap-1 cursor-pointer transition-colors font-bold shrink-0 min-h-[26px]"
                            >
                              <Send size={9} />
                              <span>Trigger Recall</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* --- RENDER 2: SYSTEM WEBHOOK CONNECTIONS & METRICS --- */}
      {activeSubTab === "connections" && (
        <div className="space-y-4">
          <div className="space-y-3">
            {integrations.map((integration) => {
              const isConnected = integration.status === "Connected";
              const isSyncingThis = syncingId === integration.software;

              return (
                <div
                  key={integration.software}
                  className="bg-white rounded-2xl p-4 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col gap-3"
                >
                  {/* Top Row: Software, Pulsing Dot, Toggle Switch */}
                  <div className="flex justify-between items-center">
                    
                    {/* Left Side: Bold Software Name & Category */}
                    <div>
                      <h4 className="text-[12px] font-sans font-extrabold text-gray-900 leading-tight">
                        {integration.software}
                      </h4>
                      <span className="text-[9px] text-gray-400 font-mono block mt-0.5 uppercase tracking-wide">
                        {integration.category}
                      </span>
                    </div>

                    {/* Center: Pulsing Status Dot */}
                    <div className="flex items-center gap-1.5 pl-2">
                      <span className="relative flex h-2 w-2">
                        {isConnected && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-[#059669]" : "bg-gray-300"}`}></span>
                      </span>
                      <span className={`text-[10px] font-mono font-medium ${isConnected ? "text-[#059669]" : "text-gray-400"}`}>
                        {isConnected ? "Connected" : "Paused"}
                      </span>
                    </div>

                    {/* Right Side: iOS Toggle Switch */}
                    <button
                      onClick={() => onToggleIntegration(integration.software)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-150 focus:outline-none shrink-0 cursor-pointer min-h-[30px] ${
                        isConnected ? "bg-[#059669]" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-150 ${
                          isConnected ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>

                  </div>

                  {/* Bottom Row: Sync Now Text click link with Spinning feedback */}
                  <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                    <button
                      disabled={!isConnected || isSyncingThis}
                      onClick={() => handleSyncClick(integration.software)}
                      className={`text-[10px] font-mono font-bold uppercase tracking-wide flex items-center gap-1.5 min-h-[24px] cursor-pointer ${
                        isConnected
                          ? "text-[#059669] hover:underline"
                          : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <RefreshCw
                        size={10}
                        className={`shrink-0 ${isSyncingThis ? "animate-spin" : ""}`}
                      />
                      <span>{isSyncingThis ? "Syncing..." : "Sync Now"}</span>
                    </button>

                    <span className="text-[9px] font-mono text-gray-400 block">
                      Last Sync: {integration.lastSync}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
