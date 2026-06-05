import { assertHttpsUrl } from './event-calendar-export'

export function buildGoogleMapsSearchUrl(location: string): string {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
  assertHttpsUrl(url)
  return url
}

export function buildWazeUrl(location: string): string {
  const url = `https://waze.com/ul?q=${encodeURIComponent(location)}`
  assertHttpsUrl(url)
  return url
}
