"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Agent, EntityStatus, Role } from "@/types";
import { seedAgents } from "@/data/seed";
import { createAppStorage } from "@/lib/app-storage";
import { generateId } from "@/lib/utils";
import { logActivity } from "@/stores/activity.store";
import { useAuthStore } from "@/stores/auth.store";

type AgentInput = Omit<Agent, "id" | "createdAt" | "lastActive">;

interface AgentsState {
  agents: Agent[];
  addAgent: (input: AgentInput) => Agent;
  updateAgent: (id: string, patch: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  deleteMany: (ids: string[]) => void;
  setAgentStatus: (id: string, status: EntityStatus) => void;
  changeRole: (id: string, role: Exclude<Role, "student">) => void;
  getAgentById: (id: string) => Agent | undefined;
  reset: () => void;
}

function actor() {
  const s = useAuthStore.getState().session;
  return { performedBy: s?.name ?? "نظام", performedByRole: s?.role };
}

export const useAgentsStore = create<AgentsState>()(
  persist(
    (set, get) => ({
      agents: seedAgents,
      addAgent: (input) => {
        const agent: Agent = {
          ...input,
          id: generateId("agent"),
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        };
        set((s) => ({ agents: [agent, ...s.agents] }));
        logActivity({
          action: "CREATE",
          entity: "agent",
          entityId: agent.id,
          description: `تم إنشاء وكيل: ${agent.name}`,
          ...actor(),
        });
        return agent;
      },
      updateAgent: (id, patch) => {
        set((s) => ({
          agents: s.agents.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        }));
        const a = get().getAgentById(id);
        logActivity({
          action: "UPDATE",
          entity: "agent",
          entityId: id,
          description: `تم تعديل الوكيل: ${a?.name ?? id}`,
          ...actor(),
        });
      },
      deleteAgent: (id) => {
        const a = get().getAgentById(id);
        set((s) => ({ agents: s.agents.filter((x) => x.id !== id) }));
        logActivity({
          action: "DELETE",
          entity: "agent",
          entityId: id,
          description: `تم حذف الوكيل: ${a?.name ?? id}`,
          ...actor(),
        });
      },
      deleteMany: (ids) => ids.forEach((id) => get().deleteAgent(id)),
      setAgentStatus: (id, status) => {
        get().updateAgent(id, { status });
        logActivity({
          action: "STATUS_CHANGE",
          entity: "agent",
          entityId: id,
          description: `تغيير حالة الوكيل إلى ${status}`,
          ...actor(),
        });
      },
      changeRole: (id, role) => {
        get().updateAgent(id, { role });
        logActivity({
          action: "STATUS_CHANGE",
          entity: "agent",
          entityId: id,
          description: `تغيير دور الوكيل إلى ${role}`,
          ...actor(),
        });
      },
      getAgentById: (id) => get().agents.find((a) => a.id === id),
      reset: () => set({ agents: seedAgents }),
    }),
    {
      name: "silent-hope-agents",
      storage: createAppStorage(),
    }
  )
);
