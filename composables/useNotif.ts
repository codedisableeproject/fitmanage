import { reactive } from 'vue'

export type NotifType = 'success' | 'error' | 'warning' | 'info'

interface NotifItem {
  id: number
  type: NotifType
  message: string
}

const state = reactive<{ items: NotifItem[] }>({ items: [] })
let counter = 0

// Toast singleton — dipasang sekali via <NotifBase /> di layout,
// dipanggil dari mana saja lewat useNotif().push(...)
export function useNotif() {
  function push(type: NotifType, message: string, timeoutMs = 3000) {
    const id = ++counter
    state.items.push({ id, type, message })
    setTimeout(() => remove(id), timeoutMs)
  }

  function remove(id: number) {
    const idx = state.items.findIndex(i => i.id === id)
    if (idx !== -1) state.items.splice(idx, 1)
  }

  return {
    state,
    remove,
    success: (msg: string) => push('success', msg),
    error: (msg: string) => push('error', msg),
    warning: (msg: string) => push('warning', msg),
    info: (msg: string) => push('info', msg)
  }
}
