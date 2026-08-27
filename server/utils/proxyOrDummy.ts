import type { H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'

/**
 * proxyOrDummy
 * ------------
 * Titik tunggal yang "menangkap" panggilan API dari frontend.
 * - Kalau BACKEND_BASE_URL sudah di-set (lihat nuxt.config.ts runtimeConfig),
 *   request diteruskan (proxy) ke backend asli dengan path & method yang sama.
 * - Kalau belum, jalankan `dummy()` yang balikin data bikinan supaya frontend
 *   tetap bisa dikembangkan tanpa nunggu backend siap.
 *
 * Jadi kalau backend sudah jadi, cukup set env BACKEND_BASE_URL — TIDAK perlu
 * ubah kode di server/api/*.ts maupun composables/useApi.ts di frontend.
 */
export async function proxyOrDummy<T>(
  event: H3Event,
  backendPath: string,
  dummy: () => Promise<T> | T
): Promise<T> {
  const config = useRuntimeConfig()

  if (config.backendBaseUrl) {
    // Diteruskan ke backend asli. Header Authorization ikut diteruskan
    // supaya token login user tetap terbawa.
    const authHeader = getHeader(event, 'authorization')
    return await $fetch<T>(backendPath, {
      baseURL: config.backendBaseUrl,
      method: event.method as any,
      headers: authHeader ? { authorization: authHeader } : undefined,
      body: ['POST', 'PUT', 'PATCH'].includes(event.method) ? await readBody(event) : undefined,
      query: getQuery(event)
    })
  }

  // --- mode dummy ---
  await delay(250 + Math.random() * 250) // simulasi network latency
  return await dummy()
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
