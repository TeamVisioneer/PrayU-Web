import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface BaseStore {
  bears: number;
  increase: (by: number) => void;
}

const useBearStore = create<BaseStore>()(
  immer((set) => ({
    bears: 0,
    increase: (by) =>
      set((state) => {
        state.bears += by;
      }),
  }))
);

export default useBearStore;
