import { defineEventHandler, readBody } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'
import { updateGymProfile } from '~~/server/utils/dummyData'
import type { GymProfile } from '~~/server/utils/dummyData'

// POST /api/gym-profile — submit wizard onboarding, tandai isOnboarded=true
export default defineEventHandler((event) =>
  proxyOrDummy(event, '/gym-profile', async () => {
    const body = await readBody<Partial<GymProfile>>(event)
    return updateGymProfile(body)
  })
)
