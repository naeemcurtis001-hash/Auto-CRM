/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ChevronRight, User, ArrowRightLeft, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { KanbanCard } from "../types";

interface MobileBaysProps {
  cards: KanbanCard[];
  onMoveCard: (cardId: string, nextColId: number) => void;
  onSimulateWebhook: () => void;
}

export default function MobileBays({ cards, onMoveCard, onSimulateWebhook }: MobileBaysProps) {
  // Segment columns: 0 = New, 1 = Sent, 2 = Declined, 3 = In Bay
  const [activeSegment, setActiveSegment] = useState<number>(0);

  const segments = [
    { id: 0, label: "Drafts", color: "bg-blue-500" },
    { id: 1, label: "Sent Quotes", color: "bg-amber-500" },
    { id: 2, label: "Declined", color: "bg-rose-500" },
    { id: 3, label: "In Service", color: "bg-emerald-500" },
  ];

  // Filter cards by columnId
  const filteredCards = cards.filter((card) => card.columnId === activeSegment);

  // Moving logic
  const handleAdvance = (card: KanbanCard) => {
    let nextColId = 0;
    if (card.columnId === 0) nextColId = 1;
    else if (card.columnId === 1) nextColId = 2; // Demo flow
    else if (card.columnId === 2) nextColId = 3; // Approved from decline!
    else if (card.columnId === 3) nextColId = 0; // Loop back
    
    onMoveCard(card.id, nextColId);
  };

  const getStatusLabel = (columnId: number) => {
    switch (columnId) {
      case 0:
        return "Draft Estimate";
      case 1:
        return "Sent & Awaiting Approval";
      case 2:
        return "Declined Risk Follow-up";
      case 3:
        return "Active In Service Bay";
      default:
        return "Draft";
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-full text-left">
      {/* 1. Header & webhook stimulation triggers */}
      <div className="flex justify-between items-center px-4">
        <div>
          <span className="text-[10px] font-mono tracking-wider text-gray-400 uppercase font-bold">
            Revenue Pipeline
          </span>
          <h2 className="text-sm font-display font-bold text-gray-950">
            Work Order Columns
          </h2>
        </div>
        
        <button
          onClick={onSimulateWebhook}
          className="flex items-center gap-1.5 bg-gray-900 text-white hover:bg-black px-3.5 py-2 rounded-xl text-[10.5px] font-mono tracking-tight transition-colors active:scale-95 shadow-sm min-h-[40px] cursor-pointer"
          id="btn-simulate-webhook"
        >
          <Sparkles size={11} className="text-amber-400 animate-pulse" />
          <span>Simulate Leads</span>
        </button>
      </div>

      {/* 2. iOS-style Segmented Control */}
      <div className="px-4">
        <div className="bg-gray-100 p-1 rounded-2xl flex w-full border border-gray-200">
          {segments.map((seg) => {
            const isActive = activeSegment === seg.id;
            const cardCount = cards.filter((c) => c.columnId === seg.id).length;
            return (
              <button
                key={seg.id}
                onClick={() => setActiveSegment(seg.id)}
                className={`relative flex-1 py-1.5 text-center rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 min-h-[38px] cursor-pointer ${
                  isActive
                    ? "bg-white text-gray-950 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <div className="flex flex-col items-center justify-center leading-none">
                  <span className="text-[11px]">{seg.label}</span>
                  <span className={`text-[9px] font-mono font-bold mt-0.5 ${isActive ? "text-gray-950" : "text-gray-400"}`}>
                    ({cardCount})
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Cards Viewport */}
      <div className="flex-1 px-4 overflow-y-auto pb-6">
        <AnimatePresence mode="popLayout">
          {filteredCards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 mt-2"
            >
              <ArrowRightLeft className="mx-auto mb-2 text-gray-300" size={24} />
              <p className="text-xs font-sans font-medium text-gray-500">No work tickets here.</p>
              <p className="text-[10px] font-mono text-gray-400 mt-2">
                Tap 'Simulate Leads' to stream a live estimation event webhook.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredCards.map((card) => (
                <motion.div
                  key={card.id}
                  layoutId={card.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl p-4 border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.015)] relative overflow-hidden"
                >
                  {/* High contrast line top decoration */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    card.columnId === 0 ? "bg-blue-400" :
                    card.columnId === 1 ? "bg-amber-400" :
                    card.columnId === 2 ? "bg-rose-400" : "bg-emerald-400"
                  }`} />

                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      {/* Name of owner */}
                      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                        <User size={10} />
                        <span className="text-[10px] font-mono tracking-tight font-bold uppercase">
                          {card.customerName}
                        </span>
                      </div>

                      {/* Main Title: Year/Make/Model */}
                      <h3 className="text-[13px] font-display font-medium text-gray-950 leading-tight">
                        {card.yearMakeModel}
                      </h3>

                      {/* Recommended Work Order Text */}
                      <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                        {card.serviceNeeded}
                      </p>
                    </div>

                    {/* Right Hand Controls badge and status indicator */}
                    <div className="flex flex-col items-end justify-start h-full shrink-0 pl-1">
                      <span className={`text-[12px] font-mono font-black py-1 px-2.5 rounded-xl block border ${
                        card.columnId === 2
                          ? "bg-rose-50 text-rose-700 border-rose-100"
                          : "bg-emerald-50 text-[#059669] border-[#10B981]/25"
                      }`}>
                        ${card.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Direct target column select panel */}
                  <div className="mt-3.5 pt-3 border-t border-gray-100">
                    <span className="text-[9.5px] font-mono text-gray-400 block uppercase tracking-wider font-extrabold mb-1.5">
                      Move Direct to Column:
                    </span>
                    <div className="grid grid-cols-4 gap-1 p-0.5 bg-gray-50 rounded-xl border border-gray-200">
                      {segments.map((seg) => {
                        const isCurrent = card.columnId === seg.id;
                        return (
                          <button
                            key={seg.id}
                            onClick={() => onMoveCard(card.id, seg.id)}
                            disabled={isCurrent}
                            className={`py-1.5 rounded-lg text-[9.5px] font-extrabold text-center transition-all cursor-pointer select-none active:scale-95 flex items-center justify-center min-h-[30px] px-1 ${
                              isCurrent
                                ? "bg-white text-gray-550 border border-gray-300 shadow-sm"
                                : seg.id === 0
                                ? "bg-transparent text-blue-600 hover:bg-blue-50/50"
                                : seg.id === 1
                                ? "bg-transparent text-amber-600 hover:bg-amber-50/50"
                                : seg.id === 2
                                ? "bg-transparent text-rose-600 hover:bg-rose-50/50 font-bold"
                                : "bg-transparent text-[#059669] hover:bg-emerald-50/50"
                            }`}
                          >
                            <span>{seg.label.replace("Quotes", "").trim()}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card footer metrics details */}
                  <div className="mt-3.5 pt-3 border-t border-gray-100 flex justify-between items-center text-[9px] font-mono text-gray-400">
                    <span>
                      Pipeline Step: <span className="text-gray-700 font-bold">{getStatusLabel(card.columnId)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>In Queue: {card.elapsed}</span>
                      {card.columnId === 2 && (
                        <span className="inline-flex items-center gap-0.5 text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded ml-1 animate-pulse">
                          <AlertCircle size={8} /> RISK
                        </span>
                      )}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
