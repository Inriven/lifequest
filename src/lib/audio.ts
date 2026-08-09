type SoundKey = 'ui.click' | 'ui.open' | 'ui.close' | 'timer.tick' | 'timer.tok' | 'task.complete'

const assetMap: Partial<Record<SoundKey, string>> = {
  'ui.click': '/assets/audio/switch_task.mp3',
  'ui.open': '/assets/audio/open_win.mp3',
  'ui.close': '/assets/audio/close_win.mp3',
}

type TickOptions = { strong?: boolean }

class AudioManager {
  enabled = true
  volume = 0.52
  private ctx?: AudioContext
  private pool = new Map<string, HTMLAudioElement>()
  private lastTickAt = 0
  private tickCooldownMs = 55
  private activeOsc?: { osc: OscillatorNode; stopAt: number }

  constructor() {
    if (typeof window !== 'undefined') {
      for (const src of Object.values(assetMap)) {
        if (!src) continue
        const el = new Audio(src)
        el.preload = 'auto'
        this.pool.set(src, el)
      }
    }
  }

  setEnabled(value: boolean) { this.enabled = value }
  setVolume(value: number) { this.volume = Math.max(0, Math.min(1, value)) }

  play(key: SoundKey, options?: TickOptions) {
    if (!this.enabled) return
    if (key === 'timer.tick' || key === 'timer.tok') {
      this.tick(Boolean(options?.strong) || key === 'timer.tok')
      return
    }
    const src = assetMap[key]
    if (!src) return
    const base = this.pool.get(src)
    const node = base ? (base.cloneNode(true) as HTMLAudioElement) : new Audio(src)
    node.volume = this.volume
    void node.play().catch(() => undefined)
  }

  tick(strong = false) {
    if (!this.enabled) return
    const now = performance.now()
    if (now - this.lastTickAt < this.tickCooldownMs) return
    this.lastTickAt = now

    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return
    this.ctx ??= new AudioContextCtor()
    const ctx = this.ctx
    if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined)

    if (this.activeOsc && ctx.currentTime < this.activeOsc.stopAt) {
      try { this.activeOsc.osc.stop() } catch { /* already stopped */ }
      this.activeOsc = undefined
    }

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = strong ? 980 : 1250
    const peak = Math.max(0.012, this.volume * (strong ? 0.1 : 0.055))
    const dur = strong ? 0.055 : 0.032
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    const stopAt = ctx.currentTime + dur + 0.01
    osc.stop(stopAt)
    this.activeOsc = { osc, stopAt }
  }
}

export const audio = new AudioManager()
