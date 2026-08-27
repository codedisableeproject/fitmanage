<script setup lang="ts">
import { useApi } from '~/composables/useApi'
import { useNotif } from '~/composables/useNotif'
import { useAlert } from '~/composables/useAlert'

definePageMeta({ layout: 'default' })

interface PosProduct {
  id: string
  name: string
  category: 'supplement' | 'food-drink'
  price: number
  stock: number
  unit: string
}
interface CartLine {
  product: PosProduct
  qty: number
}

const api = useApi()
const notif = useNotif()
const alert = useAlert()

const products = ref<PosProduct[]>([])
const loading = ref(true)
const categoryFilter = ref<'all' | 'supplement' | 'food-drink'>('all')
const search = ref('')
const buyerName = ref('')
const cart = ref<CartLine[]>([])
const checkingOut = ref(false)

async function loadProducts() {
  loading.value = true
  try {
    const res = await api.get<{ items: PosProduct[] }>('/pos/products')
    products.value = res.items
  } finally {
    loading.value = false
  }
}
onMounted(loadProducts)

const filteredProducts = computed(() => {
  let list = products.value
  if (categoryFilter.value !== 'all') list = list.filter(p => p.category === categoryFilter.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q))
  }
  return list
})

function cartQtyFor(productId: string) {
  return cart.value.find(l => l.product.id === productId)?.qty || 0
}

function addToCart(product: PosProduct) {
  const existing = cart.value.find(l => l.product.id === product.id)
  const currentQty = existing?.qty || 0
  if (currentQty >= product.stock) {
    notif.warning(`Stok ${product.name} cuma tersisa ${product.stock}`)
    return
  }
  if (existing) {
    existing.qty += 1
  } else {
    cart.value.push({ product, qty: 1 })
  }
}

function decreaseQty(line: CartLine) {
  line.qty -= 1
  if (line.qty <= 0) {
    cart.value = cart.value.filter(l => l.product.id !== line.product.id)
  }
}

function removeLine(line: CartLine) {
  cart.value = cart.value.filter(l => l.product.id !== line.product.id)
}

const cartTotal = computed(() => cart.value.reduce((sum, l) => sum + l.product.price * l.qty, 0))
const cartCount = computed(() => cart.value.reduce((sum, l) => sum + l.qty, 0))

async function handleCheckout() {
  if (cart.value.length === 0) return

  const ok = await alert.confirm(
    'Proses pembayaran?',
    `Total ${formatCurrency(cartTotal.value)} untuk ${cartCount.value} item.`,
    { confirmText: 'Bayar', cancelText: 'Batal' }
  )
  if (!ok) return

  checkingOut.value = true
  try {
    await api.post('/pos/checkout', {
      items: cart.value.map(l => ({ productId: l.product.id, qty: l.qty })),
      memberName: buyerName.value || undefined
    })
    notif.success('Pembayaran berhasil, stok diperbarui')
    cart.value = []
    buyerName.value = ''
    await loadProducts()
  } catch (e: any) {
    notif.error(e?.data?.statusMessage || 'Checkout gagal')
  } finally {
    checkingOut.value = false
  }
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <div>
    <HeaderBase title="Kasir" subtitle="Jual suplemen & makanan/minuman kulkas langsung ke member atau walk-in.">
      <template #filters>
        <v-text-field v-model="search" placeholder="Cari produk" style="max-width: 220px;">
          <template #prepend-inner><i class="mdi mdi-magnify" /></template>
        </v-text-field>
        <v-chip-group v-model="categoryFilter" mandatory>
          <v-chip value="all" size="small" variant="flat" color="primary">Semua</v-chip>
          <v-chip value="supplement" size="small" variant="flat" color="primary">Suplemen</v-chip>
          <v-chip value="food-drink" size="small" variant="flat" color="primary">Makanan & minuman</v-chip>
        </v-chip-group>
      </template>
    </HeaderBase>

    <div class="pos-kasir">
      <div class="pos-kasir__grid-wrap">
        <div v-if="loading" style="padding: 40px; text-align: center;">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else-if="filteredProducts.length === 0" class="text-muted" style="padding: 40px; text-align: center;">
          Produk tidak ditemukan.
        </div>
        <div v-else class="pos-kasir__grid">
          <button
            v-for="p in filteredProducts"
            :key="p.id"
            type="button"
            class="pos-product-card"
            :disabled="p.stock <= cartQtyFor(p.id)"
            @click="addToCart(p)"
          >
            <div class="pos-product-card__icon">
              <i class="mdi" :class="p.category === 'supplement' ? 'mdi-dumbbell' : 'mdi-food-apple-outline'" />
            </div>
            <div class="pos-product-card__name">{{ p.name }}</div>
            <div class="pos-product-card__price">{{ formatCurrency(p.price) }}</div>
            <div class="pos-product-card__stock text-muted">Stok: {{ p.stock - cartQtyFor(p.id) }} {{ p.unit }}</div>
            <span v-if="cartQtyFor(p.id) > 0" class="pos-product-card__badge">{{ cartQtyFor(p.id) }}</span>
          </button>
        </div>
      </div>

      <aside class="pos-cart">
        <div class="pos-cart__header">
          <i class="mdi mdi-cart-outline" />
          <span>Keranjang ({{ cartCount }})</span>
        </div>

        <div v-if="cart.length === 0" class="pos-cart__empty text-muted">
          Belum ada item. Klik produk di kiri buat nambahin.
        </div>

        <div v-else class="pos-cart__lines">
          <div v-for="line in cart" :key="line.product.id" class="pos-cart__line">
            <div class="pos-cart__line-info">
              <div class="pos-cart__line-name">{{ line.product.name }}</div>
              <div class="pos-cart__line-price text-muted">{{ formatCurrency(line.product.price) }}</div>
            </div>
            <div class="pos-cart__line-qty">
              <button type="button" @click="decreaseQty(line)"><i class="mdi mdi-minus" /></button>
              <span>{{ line.qty }}</span>
              <button type="button" :disabled="line.qty >= line.product.stock" @click="addToCart(line.product)">
                <i class="mdi mdi-plus" />
              </button>
            </div>
            <button type="button" class="pos-cart__line-remove" @click="removeLine(line)">
              <i class="mdi mdi-close" />
            </button>
          </div>
        </div>

        <div class="pos-cart__footer">
          <v-text-field v-model="buyerName" label="Nama pembeli (opsional)" placeholder="Walk-in customer" density="compact" hide-details="auto" style="margin-bottom: 12px;" />
          <div class="pos-cart__total">
            <span>Total</span>
            <strong>{{ formatCurrency(cartTotal) }}</strong>
          </div>
          <ButtonBase block :disabled="cart.length === 0" :loading="checkingOut" @click="handleCheckout">
            Bayar
          </ButtonBase>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.pos-kasir {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  padding: 0 24px 24px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.pos-kasir__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.pos-product-card {
  all: unset;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  background: $color-bg-surface;
  border: 1px solid $color-border-strong;
  border-radius: $radius-md;
  padding: 14px;
  cursor: pointer;
  transition: border-color .15s ease, transform .1s ease;

  &:hover:not(:disabled) { border-color: $color-primary; }
  &:active:not(:disabled) { transform: scale(0.98); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }

  &__icon {
    width: 34px; height: 34px;
    border-radius: $radius-sm;
    background: rgba(124, 111, 234, 0.16);
    color: $color-primary;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px;
    margin-bottom: 4px;
  }

  &__name { font-size: 13px; font-weight: 700; color: $color-text-primary; line-height: 1.3; }
  &__price { font-size: 13px; font-weight: 700; color: $color-primary; }
  &__stock { font-size: 11px; }

  &__badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: $color-primary;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
  }
}

.pos-cart {
  position: sticky;
  top: 16px;
  background: $color-bg-surface;
  border: 1px solid $color-border-strong;
  border-radius: $radius-lg;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 140px);

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 16px;
    border-bottom: 1px solid $color-border;
    font-size: 13px;
    font-weight: 700;
    color: $color-text-primary;

    i { color: $color-primary; }
  }

  &__empty {
    padding: 32px 16px;
    text-align: center;
    font-size: 12.5px;
  }

  &__lines {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__line {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: $radius-sm;

    &:hover { background: $color-bg-surface-2; }
  }

  &__line-info { flex: 1; min-width: 0; }
  &__line-name { font-size: 12.5px; font-weight: 600; color: $color-text-primary; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &__line-price { font-size: 11px; }

  &__line-qty {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    color: $color-text-primary;

    button {
      all: unset;
      width: 20px; height: 20px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 4px;
      background: $color-bg-surface-2;
      cursor: pointer;
      color: $color-text-secondary;

      &:hover:not(:disabled) { background: $color-primary; color: #fff; }
      &:disabled { opacity: 0.4; cursor: not-allowed; }

      i { font-size: 12px; }
    }
  }

  &__line-remove {
    all: unset;
    cursor: pointer;
    color: $color-text-muted;
    display: flex;
    padding: 2px;

    &:hover { color: $color-danger; }
  }

  &__footer {
    padding: 14px 16px;
    border-top: 1px solid $color-border;
  }

  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: $color-text-secondary;
    margin-bottom: 12px;

    strong { font-size: 18px; color: $color-text-primary; }
  }
}
</style>
