import { create } from "zustand";

type Callback = (data: any) => void;

interface EventStore {
  subscribers: Record<string, Callback[]>;

  subscribe: (event: string, callback: Callback) => void;
  unsubscribe: (event: string, callback: Callback) => void;
  publish: (event: string, data: any) => void;
}

export const useEventStore = create<EventStore>((set, get) => ({
  subscribers: {},

  subscribe: (event, callback) => {
    const { subscribers } = get();
    if (!subscribers[event]) {
      subscribers[event] = [];
    }
    subscribers[event].push(callback);
    set({ subscribers });
  },

  unsubscribe: (event, callback) => {
    const { subscribers } = get();
    if (subscribers[event]) {
      subscribers[event] = subscribers[event].filter((cb) => cb !== callback);
      set({ subscribers });
    }
  },

  publish: (event, data) => {
    const { subscribers } = get();
    if (subscribers[event]) {
      subscribers[event].forEach((callback) => callback(data));
    }
  },
}));
