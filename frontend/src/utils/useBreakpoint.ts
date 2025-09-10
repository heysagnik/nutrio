import { useState, useEffect } from 'react'

const getWidth = () => (typeof window !== 'undefined' ? window.innerWidth : 1200)

export function useBreakpoint() {
  const [width, setWidth] = useState<number>(getWidth())

  useEffect(() => {
    const onResize = () => setWidth(getWidth())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return {
    width,
    isSmallMobile: width < 420,
    isMobile: width < 720,
    isTablet: width >= 720 && width < 1200,
    isDesktop: width >= 1200,
  }
}
