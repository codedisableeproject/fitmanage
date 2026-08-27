import { reactive } from 'vue'

export type AlertType = 'success' | 'error' | 'warning' | 'confirm'

interface AlertState {
  show: boolean
  type: AlertType
  title: string
  message: string
  confirmText: string
  cancelText: string
  resolve?: (value: boolean) => void
}

const state = reactive<AlertState>({
  show: false,
  type: 'success',
  title: '',
  message: '',
  confirmText: 'OK',
  cancelText: 'Cancel'
})

// Singleton store dipakai bareng oleh DialogAlertBase (root, taruh sekali
// di layout) dan useAlert() (dipanggil dari mana saja untuk memicu alert).
export function useAlert() {
  function notify(type: AlertType, title: string, message = '') {
    state.type = type
    state.title = title
    state.message = message
    state.confirmText = 'OK'
    state.show = true
  }

  function success(title: string, message = '') { notify('success', title, message) }
  function error(title: string, message = '') { notify('error', title, message) }
  function warning(title: string, message = '') { notify('warning', title, message) }

  /** Dialog konfirmasi, dipakai dengan await. Resolve true = confirm, false = cancel. */
  function confirm(title: string, message = '', opts?: { confirmText?: string; cancelText?: string }) {
    return new Promise<boolean>((resolve) => {
      state.type = 'confirm'
      state.title = title
      state.message = message
      state.confirmText = opts?.confirmText || 'Confirm'
      state.cancelText = opts?.cancelText || 'Cancel'
      state.resolve = resolve
      state.show = true
    })
  }

  function close(result = false) {
    state.show = false
    state.resolve?.(result)
    state.resolve = undefined
  }

  return { state, success, error, warning, confirm, close }
}
