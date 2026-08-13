export function isDropLive(startsAt) {
  return new Date(startsAt) <= new Date()
}
