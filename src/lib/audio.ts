type SoundKey = 'ui.click' | 'ui.open' | 'ui.close' | 'timer.tick' | 'task.complete'

const assetMap: Partial<Record<SoundKey, string>> = {
  'ui.click': '/assets/audio/switch_task.mp3',
  'ui.open': '/assets/audio/open_win.mp3',
  'ui.close': '/assets/audio/close_win.mp3',
}

class AudioManager {
  enabled = true
  volume = 0.52
  private ctx?: AudioContext

  setEnabled(value: boolean) { this.enabled = value }
  setVolume(value: number) { this.volume = Math.max(0, Math.min(1, value)) }

  play(key: SoundKey) {
    if (!this.enabled) return
    const src = assetMap[key]
    if (src) {
      const audio = new Audio(src)
      audio.volume = this.volume
      void audio.play().catch(() => undefined)
      return
    }
    if (key === 'timer.tick') this.tick()
  }

  tick() {
    if (!this.enabled) return
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return
    this.ctx ??= new AudioContextCtor()
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = 1250
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.015, this.volume * 0.07), ctx.currentTime + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.04)
  }
}

export const audio = new AudioManager()
