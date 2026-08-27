import { defineEventHandler, getQuery } from 'h3'
import { proxyOrDummy } from '~~/server/utils/proxyOrDummy'
import { members } from '~~/server/utils/dummyData'

// GET /api/members?page=1&pageSize=10&search=
export default defineEventHandler((event) =>
  proxyOrDummy(event, '/members', () => {
    const query = getQuery(event)
    const page = Number(query.page || 1)
    const pageSize = Number(query.pageSize || 10)
    const search = String(query.search || '').toLowerCase()

    const filtered = search
      ? members.filter(m => m.name.toLowerCase().includes(search) || m.email.toLowerCase().includes(search))
      : members

    const start = (page - 1) * pageSize
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize
    }
  })
)
