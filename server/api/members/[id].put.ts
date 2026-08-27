import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'
import { members } from '~~/server/utils/dummyData'
import type { Member } from '~~/server/utils/dummyData'

// PUT /api/members/:id — update data member yang sudah ada (dipicu dari
// rowClick di pages/members/index.vue -> dialog edit).
export default defineEventHandler((event) =>
  proxyOrDummy(event, `/members/${getRouterParam(event, 'id')}`, async () => {
    const id = getRouterParam(event, 'id')
    const body = await readBody<Partial<Member>>(event)

    const idx = members.findIndex(m => m.id === id)
    if (idx === -1) {
      throw createError({ statusCode: 404, statusMessage: 'Member tidak ditemukan' })
    }

    members[idx] = { ...members[idx], ...body, id: members[idx].id }
    return members[idx]
  })
)
