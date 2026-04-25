type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

interface SoundDefinition {
  oscillatorType: OscillatorType;
  frequencySteps: Array<{ freq: number; time: number }>;
  duration: number;
  gain: number;
}

const SOUND_DEFINITIONS: Record<string, SoundDefinition> = {
  whoosh: {
    oscillatorType: 'sine',
    frequencySteps: [
      { freq: 800, time: 0 },
      { freq: 200, time: 0.15 },
    ],
    duration: 0.2,
    gain: 0.35,
  },
  click: {
    oscillatorType: 'square',
    frequencySteps: [
      { freq: 600, time: 0 },
    ],
    duration: 0.05,
    gain: 0.25,
  },
  success: {
    oscillatorType: 'sine',
    frequencySteps: [
      { freq: 523, time: 0 },
      { freq: 659, time: 0.1 },
      { freq: 784, time: 0.2 },
    ],
    duration: 0.35,
    gain: 0.35,
  },
  error: {
    oscillatorType: 'sawtooth',
    frequencySteps: [
      { freq: 300, time: 0 },
      { freq: 150, time: 0.2 },
    ],
    duration: 0.25,
    gain: 0.25,
  },
};

export async function generateSoundBuffer(
  ctx: AudioContext,
  name: string,
): Promise<AudioBuffer> {
  const def = SOUND_DEFINITIONS[name];
  if (!def) throw new Error(`Unknown sound: ${name}`);

  const sampleRate = ctx.sampleRate;
  const totalSamples = Math.ceil(sampleRate * def.duration);
  const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    let freq = def.frequencySteps[0].freq;
    for (let s = def.frequencySteps.length - 1; s >= 0; s--) {
      if (t >= def.frequencySteps[s].time) {
        const step = def.frequencySteps[s];
        const nextIdx = s + 1;
        if (nextIdx < def.frequencySteps.length) {
          const next = def.frequencySteps[nextIdx];
          const progress = (t - step.time) / (next.time - step.time);
          freq = step.freq + (next.freq - step.freq) * progress;
        } else {
          freq = step.freq;
        }
        break;
      }
    }

    const phase = 2 * Math.PI * freq * t;
    let sample: number;
    switch (def.oscillatorType) {
      case 'sine':
        sample = Math.sin(phase);
        break;
      case 'square':
        sample = Math.sin(phase) >= 0 ? 1 : -1;
        break;
      case 'sawtooth':
        sample = 2 * ((freq * t) % 1) - 1;
        break;
      case 'triangle':
        sample = 2 * Math.abs(2 * ((freq * t) % 1) - 1) - 1;
        break;
    }

    const envelope = 1 - (t / def.duration);
    data[i] = sample * def.gain * envelope;
  }

  return buffer;
}

export async function preloadAllSounds(ctx: AudioContext): Promise<Map<string, AudioBuffer>> {
  const cache = new Map<string, AudioBuffer>();
  const names = Object.keys(SOUND_DEFINITIONS);
  await Promise.all(
    names.map(async (name) => {
      const buffer = await generateSoundBuffer(ctx, name);
      cache.set(`${name}.mp3`, buffer);
    }),
  );
  return cache;
}

export function getSoundNames(): string[] {
  return Object.keys(SOUND_DEFINITIONS);
}
