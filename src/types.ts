/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ActiveBay {
  id: number;
  bayNumber: number;
  vehicle: string;
  tech: string;
  status: "In Progress" | "Awaiting Parts" | "Ready for Pickup";
  ticketValue: number;
}

export interface KanbanCard {
  id: string;
  yearMakeModel: string;
  customerName: string;
  serviceNeeded: string;
  price: number;
  elapsed: string;
  columnId: number; // 0 = New Estimates, 1 = Sent/Awaiting, 2 = Declined/Follow-up, 3 = In the Bay
}

export interface IntegrationItem {
  software: string;
  category: string;
  status: "Connected" | "Paused";
  webhooks: string;
  latency: string;
  lastSync: string;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  software: string;
  payload: string;
}
