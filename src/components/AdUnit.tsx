'use client'

import { useEffect, useRef } from 'react'

interface AdUnitProps {
  slot: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal'
  className?: string
  style?: React.CSSProperties
}

export default function AdUnit({ slot, format = 'auto', className, style }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {
      console.warn('AdSense error:', e)
    }
  }, [])

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || !slot) return null

  return (
    <div className={`ad-unit${className ? ` ${className}` : ''}`} style={{ overflow: 'hidden', textAlign: 'center', ...style }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
