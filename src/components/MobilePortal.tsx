/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Send, 
  TrendingUp, 
  Coins, 
  MessageSquare, 
  FileText, 
  Clock, 
  X, 
  Wrench, 
  ShieldAlert,
  ArrowUpRight,
  TrendingDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { KanbanCard } from "../types";

interface MobilePortalProps {
  kanbanCards: KanbanCard[];
  onMoveCard: (id: string, nextColId: number) => void;
  onCaptureApprovedRevenue: (amount: number) => void;
  onSimulateOutreach: (customer: string, text: string, flow: string) => void;
}

export default function MobilePortal({ 
  kanbanCards, 
  onMoveCard, 
  onCaptureApprovedRevenue,
  onSimulateOutreach 
}: MobilePortalProps) {
  // Selected client for focused template editing
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  // Custom draft texting template index per card
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<{ [cardId: string]: number }>({});
  
  // Success dialog metrics
  const [capturedDetails, setCapturedDetails] = useState<{ name: string; amount: number } | null>(null);

  // Filter clients representing liabilities
  const pendingPaymentCards = kanbanCards.filter(c => c.columnId === 1);
  const declinedCards = kanbanCards.filter(c => c.columnId === 2);
  
  const totalAwaitingSum = pendingPaymentCards.reduce((acc, c) => acc + c.price, 0);
  const totalDeclinedSum = declinedCards.reduce((acc, c) => acc + c.price, 0);
  const totalLiabilities = totalAwaitingSum + totalDeclinedSum;

  // Percentage values for the proportional risk chart
  const awaitingPercent = totalLiabilities > 0 ? (totalAwaitingSum / totalLiabilities) * 100 : 0;
  const declinedPercent = totalLiabilities > 0 ? (totalDeclinedSum / totalLiabilities) * 100 : 0;

  // Combined liabilities list on which the shop can act
  const targets = [...pendingPaymentCards, ...declinedCards];

  // Templates for Awaiting Checkouts (columnId = 1)
  const awaitingTemplates = [
    {
      title: "Secure Remit Checkout Link",
      text: "Hi {Customer}, repairs for your {Vehicle} are ready to start. Review and complete secured checkout of ${Price} to secure your service: https://autoconnect.io/portal/pay-{Id}"
    },
    {
      title: "Service Scheduling Confirmation",
      text: "Friendly reminder: Hi {Customer}, estimate is waiting for your signature. Authorize ${Price} now to preserve your appointment queue slot on {Elapsed}."
    }
  ];

  // Templates for Declined Service Risks (columnId = 2)
  const declinedTemplates = [
    {
      title: "Warranty & Air Hazard Warning",
      text: "Safety update for {Customer}: Declining replacement of your {Service} on the {Vehicle} voids immediate tire warranties and risks alignment wear. Complete auth today to stay protected."
    },
    {
      title: "Special Authorized Incentive Voucher",
      text: "Let's work together {Customer}. We've got an active shop opener today - authorize your declined {Service} now and we'll apply a $50 instant courtesy savings coupon: AA Recovery Center."
    }
  ];

  // Get active template list for a specific card
  const getTemplates = (card: KanbanCard) => {
    return card.columnId === 1 ? awaitingTemplates : declinedTemplates;
  };

  // Compile standard placeholder tokens
  const getCompiledText = (card: KanbanCard, templateIndex: number) => {
    const list = getTemplates(card);
    const textPattern = list[templateIndex]?.text || list[0].text;
    
    // Clean service snippet to avoid overly long SMS
    const shortService = card.serviceNeeded.split("&")[0].split("Inspection")[0].trim();

    return textPattern
      .replace(/{Customer}/g, card.customerName)
      .replace(/{Vehicle}/g, card.yearMakeModel)
      .replace(/{Service}/g, shortService)
      .replace(/{Price}/g, card.price.toLocaleString())
      .replace(/{Elapsed}/g, card.elapsed)
      .replace(/{Id}/g, card.id.replace("card-", ""));
  };

  // Triggering the automated outreach stream
  const handleDispatchSMS = (card: KanbanCard) => {
    const activeIdx = selectedTemplateIndex[card.id] || 0;
    const finalSMS = getCompiledText(card, activeIdx);
    
    // Log dispatch event back to index app
    onSimulateOutreach(
      card.customerName,
      finalSMS,
      card.columnId === 1 ? "Awaiting Balance Recover Campaign" : "Declined Safety Hazard Campaign"
    );
  };

  // Fast manual capture that pulls client from liability into paid & active state (column 3)
  const handleFastManualPaidCapture = (card: KanbanCard) => {
    // 1. Move to "In Service" columnId = 3
    onMoveCard(card.id, 3);

    // 2. Report revenue transaction capture to state
    onCaptureApprovedRevenue(card.price);

    // 3. Trigger neat animation receipt screen
    setCapturedDetails({
      name: card.customerName,
      amount: card.price
    });
  };

  return (
    <div className="relative h-full flex flex-col text-left">
      <div className="flex-1 overflow-y-auto pb-24 px-4 space-y-4">
        
        {/* iOS-Style Command Top Badge */}
        <div className="bg-emerald-50 border border-emerald-250 rounded-xl p-3 flex gap-2.5 items-start mt-1">
          <TrendingUp size={16} className="text-[#059669] mt-0.5 shrink-0" />
          <div>
            <span className="text-[9.5px] font-mono text-[#059669] font-bold uppercase tracking-wider block">
              Lost Revenue Recovery Console
            </span>
            <p className="text-[11px] text-[#065f46] font-medium leading-normal mt-0.5">
              Target clients with unpaid balances or declined repairs. Direct dispatch secure invoice reminders, air safety alerts, or incentive coupons to save leaks.
            </p>
          </div>
        </div>

        {/* --- REVENUE LIABILITY CHART ELEMENT --- */}
        <div className="bg-[#111827] text-white rounded-2xl p-4.5 shadow-sm space-y-3.5 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-10 top-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />

          {/* Header row */}
          <div className="flex justify-between items-center relative z-10">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#10B981] uppercase font-bold">
                Leaked / Pending Liability Metrics
              </span>
              <h3 className="text-base font-display font-black text-white mt-0.5 tracking-tight">
                Outstanding Exposure
              </h3>
            </div>
            
            <div className="text-right">
              <span className="text-[9px] font-mono text-zinc-400 block uppercase">Total At-Risk</span>
              <span className="text-lg font-mono font-black text-rose-400">
                ${totalLiabilities.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Dynamic Proportional Progress Bar Chart */}
          <div className="space-y-1 relative z-10">
            <div className="h-2.5 w-full bg-zinc-800 rounded-full flex overflow-hidden">
              {totalLiabilities > 0 ? (
                <>
                  <div 
                    title="Awaiting Approval Liability"
                    style={{ width: `${awaitingPercent}%` }} 
                    className="h-full bg-amber-400 transition-all duration-500" 
                  />
                  <div 
                    title="Declined/Lost Opportunity Liability"
                    style={{ width: `${declinedPercent}%` }} 
                    className="h-full bg-rose-500 transition-all duration-500" 
                  />
                </>
              ) : (
                <div className="h-full w-full bg-emerald-500/30 font-mono text-[9px] text-emerald-400 flex items-center justify-center font-bold">
                  ✓ NO ACTIVE REVENUE EXPOSURE!
                </div>
              )}
            </div>

            {/* Chart Legend with Interactive Quick Totals */}
            <div className="flex justify-between items-center text-[10.5px] font-mono pt-1 text-zinc-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shrink-0" />
                <span>Unpaid Sent Bills: <strong className="text-white">${totalAwaitingSum.toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shrink-0" />
                <span>Declined Work: <strong className="text-white">${totalDeclinedSum.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          {/* Summary metrics badge */}
          {totalLiabilities > 0 && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-2 flex justify-between items-center text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock size={11} className="text-amber-400 shrink-0" />
                Awaiting Checkouts: <strong>{pendingPaymentCards.length} clients</strong>
              </span>
              <span className="flex items-center gap-1 border-l border-zinc-800 pl-3">
                <ShieldAlert size={11} className="text-rose-400 shrink-0" />
                Declined Fixes: <strong>{declinedCards.length} clients</strong>
              </span>
            </div>
          )}
        </div>

        {/* --- TARGET CRM CLIENT CRM DIRECT CONTROL PANEL --- */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">
              Unsaved Leaks Queue ({targets.length})
            </span>
            <span className="text-[10px] font-mono text-[#059669] font-bold">
              Quick Settle Enabled
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {targets.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 text-center space-y-2.5"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Your revenue stream is pristine!</h4>
                  <p className="text-[10.5px] text-gray-400 leading-normal max-w-xs mx-auto mt-1">
                    No clients are currently in Awaiting or Declined pipelines. Simulates entries in draft/Service or decline elements to populate tracking indicators.
                  </p>
                </div>
              </motion.div>
            ) : (
              targets.map((card) => {
                const isCurrent = card.id === selectedCardId;
                const templates = getTemplates(card);
                const activeModelIndex = selectedTemplateIndex[card.id] || 0;
                const compiledMessagePreview = getCompiledText(card, activeModelIndex);
                const isDeclined = card.columnId === 2;

                return (
                  <motion.div
                    key={card.id}
                    layoutId={`recovery-${card.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-white rounded-2xl border transition-all duration-150 relative overflow-hidden ${
                      isCurrent 
                        ? "border-[#059669] ring-1 ring-[#059669]/25 shadow-md"
                        : "border-gray-200 hover:border-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                    }`}
                  >
                    {/* Status band for quick scan */}
                    <div className={`h-1 w-full ${isDeclined ? "bg-rose-500" : "bg-amber-400"}`} />

                    <div className="p-4 space-y-3">
                      {/* Top metadata row */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-sans font-black text-gray-900">
                              {card.customerName}
                            </span>
                            <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded font-black uppercase inline-block border ${
                              isDeclined 
                                ? "bg-rose-50 text-rose-700 border-rose-100" 
                                : "bg-amber-50 text-amber-800 border-amber-100"
                            }`}>
                              {isDeclined ? "Declined Repairs" : "Awaiting Checkout"}
                            </span>
                          </div>

                          <p className="text-[10.5px] text-zinc-500 font-mono mt-0.5">
                            {card.yearMakeModel} • <span className="text-gray-400 font-normal">{card.elapsed} Idle</span>
                          </p>
                        </div>

                        {/* Cost Ticket tag and collapse toggle */}
                        <div className="text-right">
                          <span className="text-xs font-mono font-black text-gray-900 font-bold block bg-gray-50 border px-1.5 py-0.5 rounded">
                            ${card.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Display Recommended Issue */}
                      <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-150 flex items-start gap-1.5">
                        <Wrench size={12} className="text-gray-450 mt-0.5 shrink-0" />
                        <p className="text-[10.5px] text-gray-650 leading-tight">
                          <strong className="text-gray-800">Flagged Issue:</strong> {card.serviceNeeded}
                        </p>
                      </div>

                      {/* Action trigger row */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setSelectedCardId(isCurrent ? null : card.id)}
                          className={`flex-1 py-1.5 px-2.5 rounded-xl border text-[10px] font-semibold flex items-center justify-center gap-1.5 min-h-[34px] cursor-pointer active:scale-97 transition-colors ${
                            isCurrent
                              ? "bg-gray-150 text-gray-800 border-gray-300"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                          }`}
                        >
                          <MessageSquare size={12} className="text-emerald-600" />
                          <span>{isCurrent ? "Minimize Template" : "Personalize SMS"}</span>
                        </button>

                        {/* Direct Secure Cash Capture */}
                        <button
                          onClick={() => handleFastManualPaidCapture(card)}
                          className="py-1.5 px-3 rounded-xl bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase flex items-center justify-center gap-1.5 min-h-[34px] cursor-pointer active:scale-97 transition-colors shrink-0"
                          title="Click to capture cash payment, move card into repair progress instantly!"
                        >
                          <Coins size={11} className="text-amber-400" />
                          <span>Settle & Paid</span>
                        </button>
                      </div>

                      {/* Expanded messaging templates selector and custom draft content preview */}
                      <AnimatePresence>
                        {isCurrent && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-2 border-t border-gray-100 space-y-3 overflow-hidden text-left"
                          >
                            
                            {/* Choose message type filter selector */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-zinc-400 block uppercase font-bold">
                                Select Campaign Outreach Nudge
                              </span>
                              <div className="grid grid-cols-2 gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-150">
                                {templates.map((temp, index) => {
                                  const isSelected = activeModelIndex === index;
                                  return (
                                    <button
                                      key={index}
                                      onClick={() => setSelectedTemplateIndex(prev => ({ ...prev, [card.id]: index }))}
                                      className={`py-1 px-2 rounded-lg text-[9px] font-mono font-bold leading-tight truncate min-h-[28px] cursor-pointer transition-all ${
                                        isSelected
                                          ? "bg-white text-gray-950 border border-zinc-200 shadow-sm"
                                          : "text-zinc-500 hover:text-zinc-800 bg-transparent"
                                      }`}
                                    >
                                      {temp.title}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* SMS Text Template Content Preview Area */}
                            <div className="bg-[#111827] text-zinc-100 rounded-xl p-3 font-mono text-[10px] space-y-1.5 border border-zinc-800">
                              <div className="flex justify-between items-center text-[8.5px] text-zinc-450 border-b border-zinc-800/60 pb-1.5">
                                <span>RECOVERY DISPATCH SMS PREVIEW</span>
                                <span className="text-emerald-400 bg-emerald-900/10 px-1 rounded font-bold">SMS Ready</span>
                              </div>
                              <p className="font-sans leading-relaxed text-zinc-200">
                                {compiledMessagePreview}
                              </p>
                            </div>

                            {/* Dispatch Action button */}
                            <button
                              onClick={() => handleDispatchSMS(card)}
                              className="w-full bg-[#059669] hover:bg-emerald-700 text-white py-2 rounded-xl text-[10.5px] font-bold flex items-center justify-center gap-1.5 min-h-[36px] cursor-pointer transition-colors active:scale-98 shadow-sm"
                            >
                              <Send size={11} className="text-emerald-250 shrink-0" />
                              <span>Dispatch Outreach Stream to {card.customerName.split(" ")[0]}</span>
                            </button>

                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* --- RECOVERY SUCCESS FULLSCREEN DIALOG --- */}
      <AnimatePresence>
        {capturedDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-950/95 backdrop-blur-sm text-white flex flex-col items-center justify-center p-6 z-50 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220 }}
              className="w-16 h-16 rounded-full bg-[#10B981] text-white flex items-center justify-center mb-4.5 shadow-[0_4px_24px_rgba(16,185,129,0.3)]"
            >
              <Check size={36} strokeWidth={3} className="text-white" />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-display font-extrabold text-white tracking-tight"
            >
              Revenue Reclaimed!
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11.5px] text-zinc-400 max-w-[260px] mt-2.5 leading-relaxed font-sans"
            >
              Invoice amount of <span className="text-white font-mono font-black border-b border-emerald-400 pb-0.5">${capturedDetails.amount.toLocaleString()}</span> for <strong className="text-white">{capturedDetails.name}</strong> was successfully captured!
            </motion.p>

            <motion.p className="text-[10px] text-[#10B981] font-mono mt-2 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-900/30">
              ⚡ MOVED TO ACTIVE BAY REPAIR WORK
            </motion.p>

            <motion.button
              onClick={() => setCapturedDetails(null)}
              className="mt-6 bg-[#111827] border border-zinc-800 hover:bg-zinc-900 text-white text-[10px] font-mono px-5 py-2.5 rounded-xl transition-colors min-h-[40px] cursor-pointer font-bold"
            >
              Dismiss Receipt
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
