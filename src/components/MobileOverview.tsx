/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TrendingUp, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { ActiveBay } from "../types";

interface MobileOverviewProps {
  aro: number;
  revenueAtRisk: number;
  capturedRevenue: number;
  activeBays: ActiveBay[];
  onNavigateToTab: (tabId: "overview" | "bays" | "portal" | "sync") => void;
}

export default function MobileOverview({
  aro,
  revenueAtRisk,
  capturedRevenue,
  activeBays,
  onNavigateToTab,
}: MobileOverviewProps) {
  // Metric Carousel Cards Data
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const adSpendData = [
    { platform: "Google Ads", spend: 4500, returns: 23400, color: "bg-[#059669]", pct: "100%" },
    { platform: "Meta Ads", spend: 2800, returns: 8200, color: "bg-[#3B82F6]", pct: "40%" },
    { platform: "Yelp Fleet", spend: 1200, returns: 3100, color: "bg-[#111827]", pct: "22%" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Metric Carousel (Horizontal Scrollable snap series) */}
      <div>
        <div className="flex justify-between items-center px-4 mb-2">
          <span className="text-[10px] font-mono tracking-wider text-gray-400 uppercase font-bold">
            Live Shop Performance
          </span>
          <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
            Swipe Core Cards
          </span>
        </div>

        {/* Swipe Container */}
        <div className="flex overflow-x-auto gap-3.5 snap-x snap-mandatory scrollbar-none px-4 pb-2">
          
          {/* Card 1: ARO */}
          <div className="w-[78vw] sm:w-64 snap-center shrink-0 bg-white rounded-2xl p-4.5 border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                Average Repair Order
              </span>
              <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                +4.2%
              </span>
            </div>
            <h3 className="text-2xl font-display font-bold text-gray-900 mt-2 leading-none">
              ${aro.toFixed(2)}
            </h3>
            <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Recommended benchmark: $600+
            </p>
          </div>

          {/* Card 2: Revenue at Risk */}
          <div className="w-[78vw] sm:w-64 snap-center shrink-0 bg-white rounded-2xl p-4.5 border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                Revenue at Risk
              </span>
              <span className="animate-pulse w-2 h-2 rounded-full bg-rose-500 mt-1"></span>
            </div>
            <h3 className="text-2xl font-display font-semibold text-rose-600 mt-2 leading-none">
              {formatCurrency(revenueAtRisk)}
            </h3>
            <button
              onClick={() => onNavigateToTab("bays")}
              className="text-[10px] text-rose-700 font-medium mt-3 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View Declined Leads</span>
              <ArrowRight size={10} />
            </button>
          </div>

          {/* Card 3: Captured Found Revenue */}
          <div className="w-[78vw] sm:w-64 snap-center shrink-0 bg-white rounded-2xl p-4.5 border border-[#10B981]/25 bg-emerald-50/5 shadow-[0_4px_15px_rgba(5,150,105,0.04)]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                Captured Revenue
              </span>
              <CheckCircle2 size={12} className="text-[#059669]" />
            </div>
            <h3 className="text-2xl font-display font-black text-[#059669] mt-2 leading-none">
              {formatCurrency(capturedRevenue)}
            </h3>
            <p className="text-[10px] text-[#059669] font-medium mt-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
              Live recaptured flow
            </p>
          </div>

        </div>
      </div>

      {/* 2. Vertical Chart Section (Stacked / clean design) */}
      <div className="mx-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] text-left">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[9px] font-mono text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-full uppercase font-bold">
              Marketing ROI
            </span>
            <h4 className="text-xs font-display font-bold text-gray-900 mt-1.5">
              Weekly Return on Ad Spend (ROAS)
            </h4>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-gray-400 block leading-none">Total Returns</span>
            <span className="text-xs font-display font-extrabold text-gray-800">$34,700</span>
          </div>
        </div>

        {/* List representation of vertical stats bar stack */}
        <div className="space-y-4">
          {adSpendData.map((channel) => {
            const roasValue = (channel.returns / channel.spend).toFixed(1);
            return (
              <div key={channel.platform} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-gray-900 font-sans">{channel.platform}</span>
                  <span className="text-gray-500 font-mono">
                    ${channel.spend.toLocaleString()} spent •{" "}
                    <span className="text-gray-900 font-bold">${channel.returns.toLocaleString()} returns</span>
                  </span>
                </div>
                {/* Horizontal Progress bar for visual rendering */}
                <div className="relative w-full h-3.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: channel.pct }}
                    transition={{ duration: 0.6 }}
                    className={`h-full ${channel.color} rounded-full`}
                  ></motion.div>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-gray-400 pt-0.5">
                  <span>Ad Spend Efficiency Ratio</span>
                  <span className="text-[#059669] font-bold font-sans">{roasValue}x ROAS</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Active Bays List */}
      <div className="mx-4 space-y-3 text-left">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-mono tracking-wider text-gray-450 uppercase font-bold">
            Active Repair Bays (1-5)
          </span>
          <span className="text-[9px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            Live Updates
          </span>
        </div>

        <div className="space-y-2.5">
          {activeBays.map((bay) => {
            const isReady = bay.status === "Ready for Pickup";
            const isParts = bay.status === "Awaiting Parts";

            return (
              <div
                key={bay.id}
                className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex justify-between items-center transition-all hover:bg-gray-50/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-gray-900 text-white w-5 h-5 rounded-md flex items-center justify-center font-bold">
                      {bay.bayNumber}
                    </span>
                    <h5 className="text-[12px] font-sans font-bold text-gray-800">
                      {bay.vehicle}
                    </h5>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono block mt-1.5 pl-1">
                    Tech: <span className="text-gray-600 font-sans font-medium">{bay.tech}</span>
                  </span>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full border leading-none font-bold ${
                      isReady
                        ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                        : isParts
                        ? "bg-rose-50 text-rose-800 border-rose-100 animate-pulse"
                        : "bg-amber-50 text-amber-800 border-amber-100"
                    }`}
                  >
                    {bay.status}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-gray-800 block mt-1.5">
                    ${bay.ticketValue.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
