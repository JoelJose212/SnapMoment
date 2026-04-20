import { useState } from 'react'

interface SplashTagProps {
  text: string
  color?: 'amber' | 'teal' | 'purple' | 'emerald'
  rotation?: number
  fontSize?: number
  className?: string
}

const colorMap = {
  amber: '#FFB800',
  teal: '#14B8A6',
  purple: '#A78BFA',
  emerald: '#10B981',
}

export default function SplashTag({ text, color = 'amber', rotation = -3, fontSize = 11, className = '' }: SplashTagProps) {
  const [wiggling, setWiggling] = useState(false)
  return (
    <span
      className={`inline-block select-none ${className} ${wiggling ? 'animate-wiggle' : ''}`}
      style={{
        background: colorMap[color],
        color: 'white',
        fontSize,
        fontWeight: 600,
        fontFamily: '"Plus Jakarta Sans"',
        padding: '3px 8px',
        borderRadius: 6,
        transform: `rotate(${rotation}deg)`,
        boxShadow: '2px 2px 0px rgba(0,0,0,0.15)',
        cursor: 'default',
        animation: 'bounceIn 0.6s ease-out both',
        letterSpacing: '0.02em',
      }}
      onMouseEnter={() => setWiggling(true)}
      onAnimationEnd={() => setWiggling(false)}
    >
      {text}
    </span>
  )
}
