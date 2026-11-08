import type { PhotoStatus } from '../api/types'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
const relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

export function formatPrice(price: string): string {
  return currency.format(Number(price))
}

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso))
}

export function formatRelative(iso: string): string {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  }
  return 'agora'
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export const STATUS_LABEL: Record<PhotoStatus, string> = {
  UPLOADING: 'Aguardando envio',
  PROCESSING: 'Processando',
  PUBLISHABLE: 'Publicada',
  ERROR: 'Erro',
}

export const STATUS_CLASS: Record<PhotoStatus, string> = {
  UPLOADING: 'bg-sub text-ink/70',
  PROCESSING: 'bg-amber-100 text-amber-800',
  PUBLISHABLE: 'bg-emerald-100 text-emerald-800',
  ERROR: 'bg-red-100 text-red-700',
}
