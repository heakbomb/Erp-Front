// modules/storeC/useStoreForm.ts
import { useState } from "react";

export function useStoreForm<T extends Record<string, any>>(initial: T) {
  const [form, setForm] = useState<T>(initial);
  const reset = (next?: Partial<T>) => setForm({ ...initial, ...next } as T);
  const set = <K extends keyof T>(key: K, value: T[K]) =>
    setForm((p) => ({ ...p, [key]: value }));
  return { form, setForm, set, reset };
}