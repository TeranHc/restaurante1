'use client'

import { useEffect, useState } from 'react'

export default function FloatingParticles({ isMobile }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const count = isMobile ? 10 : 20
    const generated = Array.from({ length: count }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${3 + Math.random() * 2}s`
    }))
    setParticles(generated)
  }, [isMobile])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((style, i) => (
        <div key={i} className="absolute animate-pulse" style={style}>
          <div className="w-1 h-1 bg-amber-400/30 rounded-full" />
        </div>
      ))}
    </div>
  )
}
