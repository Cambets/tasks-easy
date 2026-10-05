const CHANNEL_NAME = 'cta_cross_tab_sync'

let broadcastChannel: BroadcastChannel | null = null

export function getSyncChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null
  if (!('BroadcastChannel' in window)) return null
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
  }
  return broadcastChannel
}

export function notifyTabs(event: 'tasks_changed' | 'checklist_changed', payload?: any) {
  try {
    const channel = getSyncChannel()
    if (channel) {
      channel.postMessage({ type: event, payload, timestamp: Date.now() })
    }
  } catch (err) {
    console.warn('Erro ao notificar abas via BroadcastChannel:', err)
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cta_sync', { detail: { type: event, payload } }))
  }
}
