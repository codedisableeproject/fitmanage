import { defineEventHandler } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'
import { gymProfile } from '~~/server/utils/dummyData'

// GET /api/gym-profile — profil gym + status onboarding
export default defineEventHandler((event) =>
  proxyOrDummy(event, '/gym-profile', () => gymProfile)
)
