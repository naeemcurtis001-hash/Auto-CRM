/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { KanbanCard, ActiveBay, IntegrationItem, WebhookLog } from "./types";
import MobileOverview from "./components/MobileOverview";
import MobileBays from "./components/MobileBays";
import MobilePortal from "./components/MobilePortal";
import MobileSync from "./components/MobileSync";
import {
  Gauge,
  Wrench,
  Smartphone,
  Cpu,
  Zap,
  Info,
  Signal,
  Wifi,
  Battery,
  Layers,
  Sparkles,
  RefreshCw,
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Navigation: We have 4 core bottom-tab screens
  const [currentTab, setCurrentTab] = useState<"overview" | "bays" | "portal" | "sync">("overview");

  // Dynamic States
  const [revenueAtRisk, setRevenueAtRisk] = useState<number>(14850);
  const [capturedFoundRevenue, setCapturedFoundRevenue] = useState<number>(6400);

  // Core Kanban cards matching types.ts schema exactly:
  // columnId: 0 = New Estimates, 1 = Sent/Awaiting, 2 = Declined/Follow-up, 3 = In the Bay
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>([
    {
      id: "card-toyota",
      yearMakeModel: "2019 Toyota RAV4",
      customerName: "John Miller",
      serviceNeeded: "Front Brake Caliper & Pad Replacement",
      price: 650,
      elapsed: "2 hrs ago",
      columnId: 0,
    },
    {
      id: "card-subaru",
      yearMakeModel: "2021 Subaru Outback",
      customerName: "Liam Davis",
      serviceNeeded: "60k Mile Major Service Scheduled Inspection",
      price: 890,
      elapsed: "4 hrs ago",
      columnId: 0,
    },
    {
      id: "card-honda",
      yearMakeModel: "2017 Honda Civic",
      customerName: "Marcus Brody",
      serviceNeeded: "AC Compressor Replacement & Belt System",
      price: 1250,
      elapsed: "1 day ago",
      columnId: 1,
    },
    {
      id: "card-ford",
      yearMakeModel: "2015 Ford F-150",
      customerName: "David Vance",
      serviceNeeded: "Transmission Fluid Flush & OEM Spark Plugs",
      price: 1100,
      elapsed: "2 days ago",
      columnId: 2, // Declined (Risk target)
    },
    {
      id: "card-chevy",
      yearMakeModel: "2018 Chevrolet Equinox",
      customerName: "Angela Mercer",
      serviceNeeded: "Head Gasket Oil Leak Inspection & Thermostat Swap",
      price: 2400,
      elapsed: "3 days ago",
      columnId: 2, // Declined (Risk target)
    },
    {
      id: "card-bmw",
      yearMakeModel: "2020 BMW X3",
      customerName: "Rachel Cho",
      serviceNeeded: "Suspension Bushings Refresh & Wheel Alignment",
      price: 1800,
      elapsed: "5 hrs ago",
      columnId: 3,
    },
  ]);

  // Initial active bays list
  const [activeBays, setActiveBays] = useState<ActiveBay[]>([
    { id: 1, bayNumber: 1, vehicle: "2019 Tesla Model 3", tech: "Dave G.", status: "In Progress", ticketValue: 1250 },
    { id: 2, bayNumber: 2, vehicle: "2015 Ford F-150", tech: "Tyler M.", status: "Awaiting Parts", ticketValue: 680 },
    { id: 3, bayNumber: 3, vehicle: "2021 Toyota RAV4", tech: "Dave G.", status: "Ready for Pickup", ticketValue: 340 },
    { id: 4, bayNumber: 4, vehicle: "2018 Jeep Cherokee", tech: "Marcus R.", status: "In Progress", ticketValue: 1750 },
    { id: 5, bayNumber: 5, vehicle: "2022 BMW 540i", tech: "Tyler M.", status: "In Progress", ticketValue: 920 },
  ]);

  // Initial software integrations dataset
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    {
      software: "Shopmonkey API",
      category: "Shop Management System (SMS)",
      status: "Connected",
      webhooks: "4 Active Leads",
      latency: "2ms delay",
      lastSync: "Just Now",
    },
    {
      software: "Google Local Service Ads",
      category: "Lead Acquisition",
      status: "Connected",
      webhooks: "1 Active Lead",
      latency: "14ms delay",
      lastSync: "3 mins ago",
    },
    {
      software: "Meta Ads Manager",
      category: "Social Funnels",
      status: "Connected",
      webhooks: "2 Active Leads",
      latency: "22ms delay",
      lastSync: "12 mins ago",
    },
    {
      software: "QuickBooks Online",
      category: "Accounting Sync",
      status: "Connected",
      webhooks: "3 Active Leads",
      latency: "8ms delay",
      lastSync: "Just Now",
    },
  ]);

  // JSON Webhook Logs stream
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([
    {
      id: "log-1",
      timestamp: "21:54:12",
      software: "Shopmonkey API",
      payload: '{"event":"estimate.posted","estimate_id":"sms-9012","customer":"Dave G.","value":780}',
    },
    {
      id: "log-2",
      timestamp: "21:50:08",
      software: "Google Local Service Ads",
      payload: '{"event":"lead.captured","type":"Phone Call","vehicle":"2021 Toyota RAV4","service":"Brakes"}',
    },
    {
      id: "log-3",
      timestamp: "21:44:59",
      software: "QuickBooks Online",
      payload: '{"event":"invoice.synced","invoice_num":"QBO-3042","amount":1250,"status":"Unpaid"}',
    },
  ]);

  // Screen Toast Notification Overlay
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper ARO calculator: Averages active bays value + any authorized bay cards
  const totalBaysRevenue = activeBays.reduce((acc, curr) => acc + curr.ticketValue, 0);
  const totalAuthorizedBayCardsRevenue = kanbanCards
    .filter((c) => c.columnId === 3)
    .reduce((acc, curr) => acc + curr.price, 0);
  const dynamicallyCalculatedARO = Number(
    ((totalBaysRevenue + totalAuthorizedBayCardsRevenue) / (activeBays.length + kanbanCards.filter((c) => c.columnId === 3).length)).toFixed(2)
  ) || 742.50;

  // Move cards and execute precise recovery logic
  const handleMoveCard = (id: string, nextColId: number) => {
    setKanbanCards((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;

      const oldCol = target.columnId;

      // Rule: Moved OUT of Declined column (col id 2) -> Decrement Revenue at Risk, Increment Captured Found Revenue
      if (oldCol === 2 && nextColId !== 2) {
        setRevenueAtRisk((prevRisk) => Math.max(0, prevRisk - target.price));
        setCapturedFoundRevenue((prevCap) => prevCap + target.price);
        triggerToast(`🎉 Revenue Saved: Recovered $${target.price.toLocaleString()} out of Declined state!`);
      }
      // Rule: Moved INTO Declined column (col id 2) -> Increment Risk, Decrement Captured
      else if (oldCol !== 2 && nextColId === 2) {
        setRevenueAtRisk((prevRisk) => prevRisk + target.price);
        setCapturedFoundRevenue((prevCap) => Math.max(0, prevCap - target.price));
        triggerToast(`⚠️ Warning: Authorized estimate is declined. Risk increased.`);
      }

      return prev.map((c) => (c.id === id ? { ...c, columnId: nextColId } : c));
    });
  };

  // Simulate a live customer webhook streaming via n8n
  const handleSimulateWebhook = () => {
    const clients = ["William Dunlap", "Charlotte Vance", "Arthur Pendelton", "Sienna Brooks", "Jordan Miller"];
    const vehicles = ["2017 Honda Accord Coupe", "2020 Subaru Ascent", "2019 GMC Yukon XL", "2016 Lexus RX 350"];
    const services = ["Brake Pad Replacement & Fluid Bleeding", "Drive Belt Change & Idle Pulley Adjust", "Synthetic Engine Lubrication & Gaskets", "Wheel Alignment & Steering Check"];
    const estimatedCosts = [420, 680, 240, 150, 1150];

    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
    const randomService = services[Math.floor(Math.random() * services.length)];
    const randomCost = estimatedCosts[Math.floor(Math.random() * estimatedCosts.length)];

    const cardId = `webhook-lead-${Date.now()}`;
    const newLead: KanbanCard = {
      id: cardId,
      customerName: randomClient,
      yearMakeModel: randomVehicle,
      serviceNeeded: randomService,
      price: randomCost,
      elapsed: "Just now",
      columnId: 0, // Starts in New column
    };

    setKanbanCards((prev) => [newLead, ...prev]);

    // Push entry to webhooks JSON view
    const cleanStamp = new Date().toTimeString().split(" ")[0];
    const newLogItem: WebhookLog = {
      id: `log-${Date.now()}`,
      timestamp: cleanStamp,
      software: "Shopmonkey API",
      payload: JSON.stringify(
        {
          webhook_event: "customer.estimate_inquiry",
          origin: "n8n_stream_api",
          lead_id: cardId,
          estimate_details: {
            client: randomClient,
            vehicle: randomVehicle,
            required_work: randomService,
            ticket_value: randomCost,
          },
        },
        null,
        2
      ),
    };
    setWebhookLogs((logs) => [newLogItem, ...logs]);

    triggerToast(`⚡ Webhook Received: Pushed new inquiry for ${randomClient} onto Kanban pipeline!`);
  };

  // Capture repairs approved from the client-facing SMS portal simulation
  const handleCaptureApprovedRevenue = (amount: number) => {
    setCapturedFoundRevenue((prev) => prev + amount);
    triggerToast(`💳 Client Approved: Authenticated $${amount.toLocaleString()} in captured revenue!`);

    // Create Sarah Jenkins authorized card right in the Active "In Repair Bay" (col 3)
    const sarahInBayCard: KanbanCard = {
      id: `sarah-approved-${Date.now()}`,
      customerName: "Sarah Jenkins (Portal Approved)",
      yearMakeModel: "2018 Jeep Grand Cherokee",
      serviceNeeded: "Front Brake Pads (3mm) & Right Strut Replacement complete.",
      price: amount,
      elapsed: "Just now",
      columnId: 3, // In Bay
    };
    setKanbanCards((prev) => [sarahInBayCard, ...prev]);
  };

  // Toggle integration connection online/offline modes
  const handleToggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id || item.software.toLowerCase().includes(id) || item.software === id) {
          const currentStatus = item.status;
          const nextStatus = currentStatus === "Connected" ? ("Paused" as any) : ("Connected" as any);
          
          triggerToast(
            nextStatus === "Connected"
              ? `🔌 Connected ${item.software} live webhook listeners.`
              : `⏸ Paused stream for ${item.software}.`
          );
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Manual integration resync triggering timestamp update
  const handleSyncNow = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id || item.software.toLowerCase().includes(id) || item.software === id) {
          return { ...item, lastSync: "Just Now" };
        }
        return item;
      })
    );
    triggerToast(`🔄 API Cache Cleared for client. Synced fresh schemas!`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-[#111827] font-sans flex flex-col justify-start select-none relative overflow-x-hidden antialiased">
      
      {/* Toast Notification Stream overlaid across device screen */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -45 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[340px] px-3 pointer-events-none"
          >
            <div className="bg-[#111827] text-white rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.18)] border border-gray-800 flex items-start gap-2.5 pointer-events-auto">
              <span className="text-[8.5px] font-mono tracking-wider bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold shrink-0 mt-0.5">
                SYSTEM
              </span>
              <p className="text-[11px] font-medium leading-relaxed font-sans text-left">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE EXPERIENCE CONTAINER: 
          Fills exactly 100% width/height of viewport (100dvh) on true mobile, 
          and centers beautifully at a neat max-width (max-w-md) with elegant shading on desktop screens.
      */}
      <div className="relative w-full max-w-md h-[100dvh] bg-[#F3F4F6] mx-auto flex flex-col overflow-hidden shadow-2xl border-x border-gray-200">
        
        {/* iOS Application Primary Headers Section */}
        <div className="bg-[#F3F4F6] px-4 pb-3.5 pt-4 flex justify-between items-center shrink-0 border-b border-gray-200 select-none">
          <div className="text-left">
            <h1 className="text-xs font-mono font-black text-gray-400 tracking-wider uppercase leading-none">
              Auto Care HQ
            </h1>
            <h2 className="text-lg font-display font-extrabold text-[#111827] tracking-tight mt-1 leading-none">
              Command Center
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-[#111827] text-white px-2.5 py-1 rounded-full text-[9px] font-mono tracking-tight font-bold">
            <Zap size={9} className="fill-emerald-400 text-emerald-400 animate-pulse" />
            <span>n8n LIVE</span>
          </div>
        </div>

        {/* INTERACTIVE SCROLLABLE EMBEDDED CONSOLE VIEWPORT */}
        <div className="flex-1 overflow-y-auto bg-[#F3F4F6] py-3 space-y-5 relative overflow-x-hidden" id="mobile-viewport-scroller">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col"
            >
              {currentTab === "overview" && (
                <MobileOverview
                  aro={dynamicallyCalculatedARO}
                  revenueAtRisk={revenueAtRisk}
                  capturedRevenue={capturedFoundRevenue}
                  activeBays={activeBays}
                  onNavigateToTab={setCurrentTab}
                />
              )}

              {currentTab === "bays" && (
                <MobileBays
                  cards={kanbanCards}
                  onMoveCard={handleMoveCard}
                  onSimulateWebhook={handleSimulateWebhook}
                />
              )}

              {currentTab === "portal" && (
                <MobilePortal
                  kanbanCards={kanbanCards}
                  onMoveCard={handleMoveCard}
                  onCaptureApprovedRevenue={handleCaptureApprovedRevenue}
                  onSimulateOutreach={(customer, text, flow) => {
                    // Trigger visual toast
                    triggerToast(`📨 SMS Outreach Dispatched: ${customer}`);
                    
                    // Add dispatch log to n8n stream
                    const cleanStamp = new Date().toTimeString().split(" ")[0];
                    const outLogItem = {
                      id: `outreach-sms-${Date.now()}`,
                      timestamp: cleanStamp,
                      software: "Automation SMS",
                      payload: JSON.stringify(
                        {
                          webhook_event: "outbound.sms_broadcast",
                          trigger_source: "n8n_flow_designer_v2",
                          campaign: flow,
                          dispatch_status: "SENT_SUCCESS",
                          recipient_phone: "+1 (555) 019-3821",
                          lead_target: customer,
                          customized_text: text,
                          timestamp_utc: new Date().toISOString()
                        },
                        null,
                        2
                      ),
                    };
                    setWebhookLogs((logs) => [outLogItem, ...logs]);
                  }}
                />
              )}

              {currentTab === "sync" && (
                <MobileSync
                  integrations={integrations}
                  webhookLogs={webhookLogs}
                  onToggleIntegration={handleToggleIntegration}
                  onSyncNow={handleSyncNow}
                  kanbanCards={kanbanCards}
                  onSimulateOutreach={(customer, text, flow) => {
                    // Trigger visual toast
                    triggerToast(`📨 SMS Outreach Dispatched: ${customer}`);
                    
                    // Add dispatch log to n8n stream
                    const cleanStamp = new Date().toTimeString().split(" ")[0];
                    const outLogItem = {
                      id: `outreach-sms-${Date.now()}`,
                      timestamp: cleanStamp,
                      software: "Automation SMS",
                      payload: JSON.stringify(
                        {
                          webhook_event: "outbound.sms_broadcast",
                          trigger_source: "n8n_flow_designer_v2",
                          campaign: flow,
                          dispatch_status: "SENT_SUCCESS",
                          recipient_phone: "+1 (555) 019-3821",
                          lead_target: customer,
                          customized_text: text,
                          timestamp_utc: new Date().toISOString()
                        },
                        null,
                        2
                      ),
                    };
                    setWebhookLogs((logs) => [outLogItem, ...logs]);
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
          
        </div>

        {/* BOTTOM NAVIGATION TAB BAR FRAMEWORK (Sticky & Touch Friendly, Minimum 48px Touch Height Target) */}
        <div className="h-[68px] bg-white border-t border-gray-200 px-4 pb-2.5 pt-2 flex justify-around items-center shrink-0 z-40 shadow-[0_-2px_15px_rgba(0,0,0,0.02)]">
          
          {/* Overview Tab Button */}
          <button
            onClick={() => setCurrentTab("overview")}
            className="flex flex-col items-center justify-center flex-1 min-h-[48px] cursor-pointer transition-colors"
            id="tab-overview"
            title="Overview Screen"
          >
            <Gauge
              size={18}
              className={`transition-colors ${currentTab === "overview" ? "text-gray-900 stroke-[2.5]" : "text-gray-400 stroke-[2]"}`}
            />
            <span className={`text-[10px] font-sans tracking-tight font-semibold mt-1 transition-colors ${
              currentTab === "overview" ? "text-gray-950 font-bold" : "text-gray-400"
            }`}>
              Overview
            </span>
          </button>

          {/* Bays Tab Button */}
          <button
            onClick={() => setCurrentTab("bays")}
            className="flex flex-col items-center justify-center flex-1 min-h-[48px] cursor-pointer transition-colors"
            id="tab-bays"
            title="Bays Pipeline"
          >
            <Wrench
              size={18}
              className={`transition-colors ${currentTab === "bays" ? "text-gray-900 stroke-[2.5]" : "text-gray-400 stroke-[2]"}`}
            />
            <span className={`text-[10px] font-sans tracking-tight font-semibold mt-1 transition-colors ${
              currentTab === "bays" ? "text-gray-950 font-bold" : "text-gray-400"
            }`}>
              Bays
            </span>
          </button>

          {/* Recovery Tab Button */}
          <button
            onClick={() => setCurrentTab("portal")}
            className="flex flex-col items-center justify-center flex-1 min-h-[48px] cursor-pointer transition-colors relative"
            id="tab-portal"
            title="Revenue Recovery Panel"
          >
            <Coins
              size={18}
              className={`transition-colors ${currentTab === "portal" ? "text-[#10B981] stroke-[2.5]" : "text-gray-400 stroke-[2]"}`}
            />
            {/* Pulsing indicator to prompt customer signature testing */}
            {currentTab !== "portal" && (
              <span className="absolute top-[3px] right-[24px] w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            )}
            <span className={`text-[10px] font-sans tracking-tight font-semibold mt-1 transition-colors ${
              currentTab === "portal" ? "text-gray-950 font-bold" : "text-gray-400"
            }`}>
              Recovery
            </span>
          </button>

          {/* Automations Tab Button */}
          <button
            onClick={() => setCurrentTab("sync")}
            className="flex flex-col items-center justify-center flex-1 min-h-[48px] cursor-pointer transition-colors"
            id="tab-sync"
            title="API outreach Automations"
          >
            <Zap
              size={18}
              className={`transition-colors ${currentTab === "sync" ? "text-gray-900 stroke-[2.5]" : "text-gray-400 stroke-[2]"}`}
            />
            <span className={`text-[10px] font-sans tracking-tight font-semibold mt-1 transition-colors ${
              currentTab === "sync" ? "text-gray-950 font-bold" : "text-gray-400"
            }`}>
              Automations
            </span>
          </button>

        </div>

      </div>

    </div>
  );
}
