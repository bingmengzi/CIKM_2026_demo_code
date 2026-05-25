import { cn } from '@/lib/utils'
import type { PhaseKind } from '@/lib/phases'

interface AgentIconAnimatedProps {
  iconUrl: string
  alt: string
  size?: 'sm' | 'md' | 'lg'
  isActive: boolean
  isDone: boolean
  phaseKind?: PhaseKind
  accentColor: string
  glowStrong: string
}

const sizeMap = {
  sm: { wrap: 'w-9 h-9', img: 'w-7 h-7' },
  md: { wrap: 'w-11 h-11', img: 'w-8 h-8' },
  lg: { wrap: 'w-12 h-12', img: 'w-9 h-9' },
}

const phaseAnim: Record<PhaseKind, string> = {
  scan: 'animate-phase-scan',
  select: 'animate-phase-design-pulse',
  design: 'animate-phase-design-pulse',
  sketch: 'animate-phase-design-pulse',
  'gen-design': 'animate-phase-gen-shimmer',
  'gen-assets': 'animate-phase-gen-shimmer',
  plan: 'animate-phase-design-pulse',
  code: 'animate-phase-code-blink',
  deploy: 'animate-phase-deploy-up',
  capture: 'animate-phase-test-snap',
  verify: 'animate-phase-design-pulse',
  fix: 'animate-phase-code-blink',
}

export function AgentIconAnimated({
  iconUrl,
  alt,
  size = 'md',
  isActive,
  isDone,
  phaseKind,
  accentColor,
  glowStrong,
}: AgentIconAnimatedProps) {
  const sz = sizeMap[size]
  const imgAnim = isActive && phaseKind ? phaseAnim[phaseKind] : ''
  const showScanLine = isActive && phaseKind === 'scan'
  const showGenDots = isActive && (phaseKind === 'gen-design' || phaseKind === 'gen-assets')
  const showCodeDots = isActive && phaseKind === 'code'

  return (
    <div className="relative shrink-0">
      {isActive && (
        <div
          className="absolute -inset-1 rounded-full animate-ring-spin"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${glowStrong} 90deg, transparent 180deg, ${glowStrong} 270deg, transparent 360deg)`,
            mask: 'radial-gradient(circle, transparent 60%, black 62%)',
            WebkitMask: 'radial-gradient(circle, transparent 60%, black 62%)',
          }}
        />
      )}
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center transition-all duration-400 overflow-hidden',
          sz.wrap,
          isActive && 'bg-white shadow-md animate-agent-icon-float',
          isDone && 'bg-white shadow-sm',
          !isActive && !isDone && 'bg-border-light/40 grayscale opacity-60'
        )}
      >
        <img
          src={iconUrl}
          alt={alt}
          className={cn(
            sz.img,
            'object-contain transition-all duration-400',
            imgAnim,
            !isActive && !isDone && 'opacity-70'
          )}
        />

        {/* Scan line overlay */}
        {showScanLine && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
            <div
              className="absolute left-0 right-0 h-[2px] animate-phase-scan-line"
              style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
            />
          </div>
        )}

        {/* Sparkle dots when generating */}
        {showGenDots && (
          <>
            <span
              className="pointer-events-none absolute top-1 right-1 w-1.5 h-1.5 rounded-full animate-phase-gen-dots"
              style={{ background: accentColor, animationDelay: '0ms' }}
            />
            <span
              className="pointer-events-none absolute bottom-1.5 left-1 w-1 h-1 rounded-full animate-phase-gen-dots"
              style={{ background: accentColor, animationDelay: '300ms' }}
            />
            <span
              className="pointer-events-none absolute top-2 left-2 w-1 h-1 rounded-full animate-phase-gen-dots"
              style={{ background: accentColor, animationDelay: '600ms' }}
            />
          </>
        )}

        {/* Caret pulse when coding */}
        {showCodeDots && (
          <span
            className="pointer-events-none absolute bottom-1 right-1.5 w-1 h-3 rounded-sm animate-phase-code-blink"
            style={{ background: accentColor }}
          />
        )}
      </div>
    </div>
  )
}
