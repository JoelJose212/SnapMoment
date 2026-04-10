import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const { resolvedTheme } = useTheme()

  // Update cursor color based on theme
  useEffect(() => {
    const el = cursorRef.current
    if (!el) return
    if (resolvedTheme === 'dark') {
      el.style.background = 'rgba(255,255,255,0.9)'
      el.style.mixBlendMode = 'difference'
    } else {
      el.style.background = '#FF6E6C'
      el.style.mixBlendMode = 'multiply'
    }
  }, [resolvedTheme])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }
    const onEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-cursor="pointer"], a, button, [role="button"]')) {
        cursorRef.current?.classList.add('expanded')
      } else {
        cursorRef.current?.classList.remove('expanded')
      }
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onEnter)

    let raf: number
    const animate = () => {
      const LERP = 0.35
      current.current.x += (pos.current.x - current.current.x) * LERP
      current.current.y += (pos.current.y - current.current.y) * LERP
      if (cursorRef.current) {
        cursorRef.current.style.left = `${current.current.x}px`
        cursorRef.current.style.top = `${current.current.y}px`
      }
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onEnter)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div id="custom-cursor" ref={cursorRef} />
}
