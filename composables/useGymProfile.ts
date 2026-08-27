import { useCookie } from '#imports'
import { useApi } from '~/composables/useApi'

export interface GymProfileForm {
  name: string
  address: string
  city: string
  phone: string
  openTime: string
  closeTime: string
  description: string
}

/**
 * useGymProfile
 * -------------
 * Nyimpen status "sudah isi form kelengkapan gym atau belum" di cookie
 * (`fm_onboarded`), dicek cepat di middleware TANPA perlu hit API setiap
 * pindah halaman. Status sesungguhnya tetap di server (dummy: lihat
 * server/utils/dummyData.ts -> gymProfile.isOnboarded), cookie ini cuma
 * cache ringan di sisi client.
 *
 * Pakai useApi() (bukan $fetch langsung) supaya konsisten sama request
 * lain di app ini — otomatis kebawa header Authorization & auto-logout
 * kalau token invalid (401).
 */
export function useGymProfile() {
  const isOnboarded = useCookie<boolean>('fm_onboarded', { default: () => false })
  const api = useApi()

  async function fetchStatus() {
    try {
      const profile = await api.get<{ isOnboarded: boolean }>('/gym-profile')
      isOnboarded.value = profile.isOnboarded
      return profile
    } catch {
      return null
    }
  }

  async function submitOnboarding(form: GymProfileForm) {
    const profile = await api.post('/gym-profile', form)
    isOnboarded.value = true
    return profile
  }

  return { isOnboarded, fetchStatus, submitOnboarding }
}
