import { useAuth } from '~/composables/useAuth'

/**
 * useApi
 * ------
 * Satu pintu untuk semua pemanggilan API dari komponen/halaman. Selalu
 * memanggil route lokal Nuxt (`/api/...`), yang di server (lihat
 * server/api/*.ts + server/utils/proxyOrDummy.ts) diteruskan ke backend
 * asli kalau BACKEND_BASE_URL sudah di-set, atau balikin dummy data kalau
 * belum. Jadi kode di halaman TIDAK PERNAH perlu tahu backend sudah jadi
 * atau belum — tinggal pakai useApi() seperti biasa.
 *
 * Contoh:
 *   const api = useApi()
 *   const { items, total } = await api.get('/members', { query: { page: 1 } })
 */
export function useApi() {
  const { token, logout } = useAuth()

  async function request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, opts: { query?: Record<string, any>; body?: any } = {}) {
    try {
      return await $fetch<T>(`/api${path}`, {
        method,
        query: opts.query,
        body: opts.body,
        headers: token.value ? { authorization: `Bearer ${token.value}` } : undefined
      })
    } catch (err: any) {
      if (err?.statusCode === 401) {
        // Token expired/invalid — paksa logout supaya user login ulang.
        logout()
      }
      throw err
    }
  }

  return {
    get: <T>(path: string, opts?: { query?: Record<string, any> }) => request<T>('GET', path, opts),
    post: <T>(path: string, body?: any) => request<T>('POST', path, { body }),
    put: <T>(path: string, body?: any) => request<T>('PUT', path, { body }),
    del: <T>(path: string) => request<T>('DELETE', path)
  }
}
