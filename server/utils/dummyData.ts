/**
 * Dummy data store — sementara backend belum siap.
 * Semua server/api/*.ts import dari sini. Kalau backend sudah jadi,
 * file ini otomatis tidak kepakai lagi (proxyOrDummy akan memilih jalur
 * proxy, bukan dummy), jadi aman dibiarkan atau dihapus belakangan.
 */

export interface Member {
  id: string
  name: string
  email: string
  phone: string
  packageName: string
  packageId?: string
  joinDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'frozen'
}

export interface MembershipPackage {
  id: string
  name: string
  durationMonths: number
  price: number
  benefits: string[]
  activeMembers: number
}

export interface Transaction {
  id: string
  memberName: string
  type: 'membership' | 'personal-training' | 'merchandise'
  amount: number
  date: string
  status: 'paid' | 'pending' | 'refunded'
}

export interface ScheduleClass {
  id: string
  className: string
  coach: string
  day: string
  time: string
  capacity: number
  booked: number
}

export const members: Member[] = [
  { id: 'M-001', name: 'Andi Wijaya', email: 'andi.wijaya@example.com', phone: '0812-3456-7890', packageName: 'Gold - 6 bulan', joinDate: '2026-02-01', expiryDate: '2026-08-01', status: 'active' },
  { id: 'M-002', name: 'Siti Rahma', email: 'siti.rahma@example.com', phone: '0813-2233-4455', packageName: 'Silver - 3 bulan', joinDate: '2026-05-10', expiryDate: '2026-08-10', status: 'active' },
  { id: 'M-003', name: 'Budi Santoso', email: 'budi.santoso@example.com', phone: '0821-9988-7766', packageName: 'Platinum - 12 bulan', joinDate: '2025-09-01', expiryDate: '2026-09-01', status: 'active' },
  { id: 'M-004', name: 'Dewi Lestari', email: 'dewi.lestari@example.com', phone: '0856-1122-3344', packageName: 'Gold - 6 bulan', joinDate: '2026-01-15', expiryDate: '2026-07-15', status: 'expired' },
  { id: 'M-005', name: 'Fajar Nugroho', email: 'fajar.nugroho@example.com', phone: '0877-5566-7788', packageName: 'Silver - 3 bulan', joinDate: '2026-07-01', expiryDate: '2026-10-01', status: 'frozen' }
]

export const packages: MembershipPackage[] = [
  { id: 'P-001', name: 'Silver', durationMonths: 3, price: 450000, benefits: ['Akses gym reguler', 'Locker'], activeMembers: 2 },
  { id: 'P-002', name: 'Gold', durationMonths: 6, price: 800000, benefits: ['Akses gym reguler', 'Kelas grup', 'Locker'], activeMembers: 2 },
  { id: 'P-003', name: 'Platinum', durationMonths: 12, price: 1400000, benefits: ['Akses gym 24 jam', 'Kelas grup', 'Personal training 2x/bulan', 'Locker'], activeMembers: 1 }
]

export const transactions: Transaction[] = [
  { id: 'TRX-1001', memberName: 'Andi Wijaya', type: 'membership', amount: 800000, date: '2026-02-01', status: 'paid' },
  { id: 'TRX-1002', memberName: 'Siti Rahma', type: 'membership', amount: 450000, date: '2026-05-10', status: 'paid' },
  { id: 'TRX-1003', memberName: 'Budi Santoso', type: 'personal-training', amount: 300000, date: '2026-07-20', status: 'paid' },
  { id: 'TRX-1004', memberName: 'Fajar Nugroho', type: 'merchandise', amount: 150000, date: '2026-08-02', status: 'pending' }
]

export const schedule: ScheduleClass[] = [
  { id: 'C-001', className: 'Yoga pagi', coach: 'Coach Rani', day: 'Senin', time: '06:00 - 07:00', capacity: 20, booked: 14 },
  { id: 'C-002', className: 'HIIT', coach: 'Coach Bayu', day: 'Selasa', time: '18:00 - 19:00', capacity: 15, booked: 15 },
  { id: 'C-003', className: 'Zumba', coach: 'Coach Rani', day: 'Rabu', time: '17:00 - 18:00', capacity: 25, booked: 9 },
  { id: 'C-004', className: 'Strength training', coach: 'Coach Dimas', day: 'Kamis', time: '19:00 - 20:00', capacity: 12, booked: 10 }
]

export function dashboardSummary() {
  return {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    revenueThisMonth: transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0),
    upcomingClasses: schedule.length
  }
}

export const revenueTrend = [
  { month: 'Mar', amount: 5200000 },
  { month: 'Apr', amount: 6100000 },
  { month: 'Mei', amount: 5800000 },
  { month: 'Jun', amount: 7400000 },
  { month: 'Jul', amount: 8100000 },
  { month: 'Agu', amount: 7650000 }
]

export interface ClassAttendance {
  id: string
  className: string
  day: string
  capacity: number
  booked: number
  attended: number
}

export const classAttendance: ClassAttendance[] = [
  { id: 'C-001', className: 'Yoga pagi', day: 'Senin', capacity: 20, booked: 14, attended: 12 },
  { id: 'C-002', className: 'HIIT', day: 'Selasa', capacity: 15, booked: 15, attended: 13 },
  { id: 'C-003', className: 'Zumba', day: 'Rabu', capacity: 25, booked: 9, attended: 8 },
  { id: 'C-004', className: 'Strength training', day: 'Kamis', capacity: 12, booked: 10, attended: 9 }
]

// =========================================================
// Gym profile — diisi lewat wizard onboarding (pages/onboarding.vue)
// pas pertama kali owner register. `isOnboarded` false berarti wizard
// belum pernah diselesaikan.
// =========================================================
export interface GymProfile {
  isOnboarded: boolean
  name: string
  address: string
  city: string
  phone: string
  openTime: string
  closeTime: string
  description: string
}

export const gymProfile: GymProfile = {
  isOnboarded: false,
  name: '',
  address: '',
  city: '',
  phone: '',
  openTime: '06:00',
  closeTime: '22:00',
  description: ''
}

export function updateGymProfile(patch: Partial<GymProfile>) {
  Object.assign(gymProfile, patch, { isOnboarded: true })
  return gymProfile
}

// =========================================================
// POS — Master data produk (suplemen & makanan/minuman kulkas) + kasir
// =========================================================
export interface PosProduct {
  id: string
  name: string
  category: 'supplement' | 'food-drink'
  price: number
  stock: number
  unit: string
}

export const posProducts: PosProduct[] = [
  { id: 'PRD-001', name: 'Whey Protein 1kg', category: 'supplement', price: 450000, stock: 12, unit: 'jar' },
  { id: 'PRD-002', name: 'Creatine Monohydrate', category: 'supplement', price: 220000, stock: 20, unit: 'jar' },
  { id: 'PRD-003', name: 'BCAA 2:1:1', category: 'supplement', price: 180000, stock: 15, unit: 'jar' },
  { id: 'PRD-004', name: 'Pre-Workout', category: 'supplement', price: 250000, stock: 8, unit: 'jar' },
  { id: 'PRD-005', name: 'Air Mineral 600ml', category: 'food-drink', price: 5000, stock: 60, unit: 'botol' },
  { id: 'PRD-006', name: 'Minuman Isotonik', category: 'food-drink', price: 12000, stock: 40, unit: 'botol' },
  { id: 'PRD-007', name: 'Protein Bar', category: 'food-drink', price: 25000, stock: 30, unit: 'pcs' },
  { id: 'PRD-008', name: 'Pisang', category: 'food-drink', price: 5000, stock: 25, unit: 'pcs' }
]

export function createPosProduct(input: Omit<PosProduct, 'id'>): PosProduct {
  const product: PosProduct = { id: 'PRD-' + String(posProducts.length + 1).padStart(3, '0'), ...input }
  posProducts.push(product)
  return product
}

// =========================================================
// Instruktur gym — dipakai di form tambah member (opsi tambahan
// personal training) & bisa dikembangkan jadi master data sendiri nanti.
// =========================================================
export interface Instructor {
  id: string
  name: string
  specialty: string
  pricePerSession: number
}

export const instructors: Instructor[] = [
  { id: 'INS-001', name: 'Coach Bayu', specialty: 'Strength & Conditioning', pricePerSession: 150000 },
  { id: 'INS-002', name: 'Coach Rani', specialty: 'Yoga & Flexibility', pricePerSession: 120000 },
  { id: 'INS-003', name: 'Coach Dimas', specialty: 'Bodybuilding', pricePerSession: 150000 }
]
