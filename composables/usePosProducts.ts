import { useApi } from '~/composables/useApi'

export interface PosProduct {
  id: string
  name: string
  category: 'supplement' | 'food-drink'
  price: number
  stock: number
  unit: string
}

/**
 * usePosProducts
 * --------------
 * Logic yang dipakai bareng oleh pages/pos/supplements.vue dan
 * pages/pos/fridge.vue — dua halaman itu bedanya cuma filter category,
 * jadi daripada duplikasi fetch/create logic, ditaruh di sini.
 */
export function usePosProducts(category: 'supplement' | 'food-drink') {
  const api = useApi()
  const items = ref<PosProduct[]>([])
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      const res = await api.get<{ items: PosProduct[] }>('/pos/products', { query: { category } })
      items.value = res.items
    } finally {
      loading.value = false
    }
  }

  async function create(input: { name: string; price: number; stock: number; unit: string }) {
    await api.post('/pos/products', { ...input, category })
    await load()
  }

  return { items, loading, load, create }
}
