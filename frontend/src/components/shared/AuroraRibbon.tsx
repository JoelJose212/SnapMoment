import { Camera, Circle } from 'lucide-react'

const MARQUEE_TEXT = '✦ Every memory deserves to be found instantly · SnapMoment — Built for photographers who care · ✦ Scan. Smile. Receive. That simple. ✦ Your photos, ✦ Your privacy, ✦ Your moment · ✦ Now serving 200+ photographers across India · ✦ AI that sees you the way your loved ones do   '

export default function AuroraRibbon() {
  return (
    <div className="aurora-bg w-full" style={{ height: 36, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
      {/* Left pin */}
      <div className="flex items-center gap-1.5 pl-3 pr-4 z-10 shrink-0" style={{ background: 'rgba(0,0,0,0.15)', height: '100%' }}>
        <Camera size={14} color="var(--card)" />
        <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 15, fontWeight: 600, color: 'white', letterSpacing: '0.05em' }}>SnapMoment</span>
      </div>

      {/* Scrolling marquee */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div
          className="animate-marquee"
          style={{
            display: 'flex',
            width: 'max-content',
          }}
        >
          {[0, 1].map((i) => (
            <span
              key={i}
              style={{
                fontFamily: '"Plus Jakarta Sans"',
                fontSize: 15,
                fontWeight: 600,
                color: 'rgba(255, 253, 253, 0.92)',
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
                paddingRight: '2rem',
              }}
            >
              {MARQUEE_TEXT}
            </span>
          ))}
        </div>
      </div>

      {/* Right pin */}
      <div className="flex items-center gap-1.5 pr-3 pl-4 z-10 shrink-0" style={{ background: 'rgba(0,0,0,0.15)', height: '100%' }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#00C48C',
            display: 'inline-block',
            animation: 'pulse 1.5s ease-in-out infinite',
            boxShadow: '0 0 0 0 rgba(0,196,140,0.7)',
          }}
        />
        <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Live events now</span>
      </div>
    </div>
  )
}
