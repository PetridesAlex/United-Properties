import {Children, useCallback, useLayoutEffect, useRef} from 'react'
import Lenis from 'lenis'
import './ScrollStack.css'

export const ScrollStackItem = ({children, itemClassName = ''}) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
)

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}) => {
  const scrollerRef = useRef(null)
  const stackCompletedRef = useRef(false)
  const animationFrameRef = useRef(null)
  const lenisRef = useRef(null)
  const cardsRef = useRef([])
  const rafPendingRef = useRef(false)
  const sectionActiveRef = useRef(true)
  const nativeCleanupRef = useRef(null)

  const calculateProgress = useCallback((scrollTop, start, end) => {
    if (scrollTop < start) return 0
    if (scrollTop > end) return 1
    return (scrollTop - start) / (end - start)
  }, [])

  const parsePercentage = useCallback((value, containerHeight) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight
    }
    return parseFloat(value)
  }, [])

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      const vv = typeof window !== 'undefined' ? window.visualViewport : null
      return {
        scrollTop: window.scrollY ?? document.documentElement.scrollTop,
        containerHeight: vv?.height ?? window.innerHeight,
      }
    }

    const scroller = scrollerRef.current
    return {
      scrollTop: scroller?.scrollTop ?? 0,
      containerHeight: scroller?.clientHeight ?? window.innerHeight,
    }
  }, [useWindowScroll])

  /** Layout offset — never use transformed rects (avoids feedback jitter). */
  const getElementOffset = useCallback(
    (element) => {
      if (!element) return 0
      if (useWindowScroll) {
        let current = element
        let offsetTop = 0
        while (current) {
          offsetTop += current.offsetTop || 0
          current = current.offsetParent
        }
        return offsetTop
      }
      return element.offsetTop
    },
    [useWindowScroll],
  )

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || !sectionActiveRef.current) return

    const {scrollTop, containerHeight} = getScrollData()
    const stackPositionPx = parsePercentage(stackPosition, containerHeight)
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight)

    const endElement = scrollerRef.current?.querySelector('.scroll-stack-end')
    const endElementTop = endElement ? getElementOffset(endElement) : 0

    cardsRef.current.forEach((card, i) => {
      if (!card) return

      const cardTop = getElementOffset(card)
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i
      const triggerEnd = cardTop - scaleEndPositionPx
      const pinStart = triggerStart
      const pinEnd = endElementTop - containerHeight * 0.35

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd)
      const targetScale = Math.min(1, baseScale + i * itemScale)
      const scale = 1 - scaleProgress * (1 - targetScale)
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0

      let blur = 0
      if (blurAmount) {
        let topCardIndex = 0
        for (let j = 0; j < cardsRef.current.length; j += 1) {
          const jCardTop = getElementOffset(cardsRef.current[j])
          const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j
          if (scrollTop >= jTriggerStart) topCardIndex = j
        }
        if (i < topCardIndex) {
          blur = Math.max(0, (topCardIndex - i) * blurAmount)
        }
      }

      const pinnedY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i
      const heldY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i
      // Ease cards back to natural flow after pin ends so they clear the next section.
      const releaseDistance = Math.max(160, containerHeight * 0.45)
      let translateY = 0
      let releaseScale = scale

      if (scrollTop >= pinStart && scrollTop <= pinEnd) {
        translateY = pinnedY
      } else if (scrollTop > pinEnd) {
        const releaseProgress = Math.min(1, Math.max(0, (scrollTop - pinEnd) / releaseDistance))
        const ease = 1 - (1 - releaseProgress) ** 2
        translateY = heldY * (1 - ease)
        releaseScale = scale + (1 - scale) * ease
        blur = blur * (1 - ease)
      }

      const ty = Math.round(translateY * 100) / 100
      const sc = Math.round(releaseScale * 1000) / 1000
      const rot = Math.round(rotation * 100) / 100
      const bl = Math.round(blur * 100) / 100

      const transformStr = `translate3d(0, ${ty}px, 0) scale(${sc}) rotate(${rot}deg)`
      const filterStr = bl > 0 ? `blur(${bl}px)` : ''

      if (card.dataset.stackTx !== transformStr) {
        card.dataset.stackTx = transformStr
        card.style.transform = transformStr
      }
      if (card.dataset.stackFl !== filterStr) {
        card.dataset.stackFl = filterStr
        card.style.filter = filterStr
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true
          onStackComplete?.()
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false
        }
      }
    })
  }, [
    baseScale,
    blurAmount,
    calculateProgress,
    getElementOffset,
    getScrollData,
    itemScale,
    itemStackDistance,
    onStackComplete,
    parsePercentage,
    rotationAmount,
    scaleEndPosition,
    stackPosition,
  ])

  const scheduleTransformUpdate = useCallback(() => {
    if (rafPendingRef.current) return
    rafPendingRef.current = true
    requestAnimationFrame(() => {
      rafPendingRef.current = false
      updateCardTransforms()
    })
  }, [updateCardTransforms])

  const isTouchViewport = useCallback(() => {
    if (typeof window === 'undefined') return true
    return (
      window.matchMedia('(hover: none), (pointer: coarse)').matches || window.innerWidth <= 1024
    )
  }, [])

  const detachNativeScroll = useCallback(() => {
    nativeCleanupRef.current?.()
  }, [])

  const attachNativeScroll = useCallback(() => {
    if (nativeCleanupRef.current) return
    const scroller = scrollerRef.current
    if (!scroller) return

    const target = useWindowScroll ? window : scroller
    const onNativeScroll = () => scheduleTransformUpdate()
    const onViewportChange = () => scheduleTransformUpdate()

    target.addEventListener('scroll', onNativeScroll, {passive: true})
    window.addEventListener('resize', onViewportChange, {passive: true})
    window.visualViewport?.addEventListener('resize', onViewportChange, {passive: true})
    window.visualViewport?.addEventListener('scroll', onViewportChange, {passive: true})

    nativeCleanupRef.current = () => {
      target.removeEventListener('scroll', onNativeScroll)
      window.removeEventListener('resize', onViewportChange)
      window.visualViewport?.removeEventListener('resize', onViewportChange)
      window.visualViewport?.removeEventListener('scroll', onViewportChange)
      nativeCleanupRef.current = null
    }
  }, [scheduleTransformUpdate, useWindowScroll])

  const stopLenisLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  const destroyLenis = useCallback(() => {
    stopLenisLoop()
    if (lenisRef.current) {
      lenisRef.current.destroy()
      lenisRef.current = null
    }
  }, [stopLenisLoop])

  const startLenisLoop = useCallback(() => {
    if (!lenisRef.current || animationFrameRef.current) return

    const raf = (time) => {
      if (!sectionActiveRef.current || !lenisRef.current) {
        animationFrameRef.current = null
        return
      }
      lenisRef.current.raf(time)
      updateCardTransforms()
      animationFrameRef.current = requestAnimationFrame(raf)
    }
    animationFrameRef.current = requestAnimationFrame(raf)
  }, [updateCardTransforms])

  const createLenis = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller || lenisRef.current) return false

    const baseOptions = {
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
      wheelMultiplier: 0.85,
      lerp: 0.09,
      syncTouch: true,
      syncTouchLerp: 0.075,
    }

    lenisRef.current = useWindowScroll
      ? new Lenis(baseOptions)
      : new Lenis({
          ...baseOptions,
          wrapper: scroller,
          content: scroller.querySelector('.scroll-stack-inner'),
          touchInertiaMultiplier: 35,
          touchInertia: 0.6,
        })

    startLenisLoop()
    return true
  }, [startLenisLoop, useWindowScroll])

  const activateScrollDriver = useCallback(() => {
    if (isTouchViewport()) {
      destroyLenis()
      attachNativeScroll()
      return
    }
    detachNativeScroll()
    createLenis()
  }, [attachNativeScroll, createLenis, destroyLenis, detachNativeScroll, isTouchViewport])

  const deactivateScrollDriver = useCallback(() => {
    // Destroy Lenis so the rest of the page keeps native wheel — never freeze scroll.
    destroyLenis()
    attachNativeScroll()
  }, [attachNativeScroll, destroyLenis])

  const cardCount = Children.count(children)

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return undefined

    // Always scope to this instance — never query the whole document.
    const cards = Array.from(scroller.querySelectorAll('.scroll-stack-card'))
    cardsRef.current = cards

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`
      } else {
        card.style.marginBottom = '0px'
      }
      card.style.willChange = 'transform, filter'
      card.style.transformOrigin = 'top center'
      card.style.backfaceVisibility = 'hidden'
      card.style.webkitBackfaceVisibility = 'hidden'
      card.style.transform = 'translate3d(0, 0, 0)'
      card.dataset.stackTx = ''
      card.dataset.stackFl = ''
    })

    activateScrollDriver()
    updateCardTransforms()

    // Smooth Lenis only while the stack is near the viewport — keeps the rest of the page snappy.
    const io = new IntersectionObserver(
      ([entry]) => {
        const active = Boolean(entry?.isIntersecting)
        sectionActiveRef.current = active
        if (active) {
          activateScrollDriver()
          scheduleTransformUpdate()
        } else {
          deactivateScrollDriver()
        }
      },
      {root: null, rootMargin: '55% 0px', threshold: 0},
    )
    io.observe(scroller)

    const onResize = () => {
      // Re-pick driver if crossing desktop/touch breakpoints.
      if (sectionActiveRef.current) activateScrollDriver()
      scheduleTransformUpdate()
    }
    window.addEventListener('resize', onResize, {passive: true})

    // Images / late layout can shift card offsets.
    const resizeObserver = new ResizeObserver(() => scheduleTransformUpdate())
    resizeObserver.observe(scroller)
    cards.forEach((card) => {
      resizeObserver.observe(card)
      const img = card.querySelector('img')
      if (img && !img.complete) {
        img.addEventListener('load', scheduleTransformUpdate)
        img.addEventListener('error', scheduleTransformUpdate)
      }
    })

    const warm = window.setTimeout(() => updateCardTransforms(), 120)
    const warm2 = window.setTimeout(() => updateCardTransforms(), 500)

    return () => {
      window.clearTimeout(warm)
      window.clearTimeout(warm2)
      io.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener('resize', onResize)
      detachNativeScroll()
      destroyLenis()
      cards.forEach((card) => {
        const img = card.querySelector('img')
        if (img) {
          img.removeEventListener('load', scheduleTransformUpdate)
          img.removeEventListener('error', scheduleTransformUpdate)
        }
      })
      cardsRef.current = []
      stackCompletedRef.current = false
      rafPendingRef.current = false
    }
  }, [
    activateScrollDriver,
    cardCount,
    deactivateScrollDriver,
    destroyLenis,
    detachNativeScroll,
    itemDistance,
    scaleDuration,
    scheduleTransformUpdate,
    updateCardTransforms,
  ])

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" aria-hidden="true" />
      </div>
    </div>
  )
}

export default ScrollStack
