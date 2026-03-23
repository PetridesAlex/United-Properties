import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { Instagram, Linkedin, MessageCircle, X } from 'lucide-react'
import './StaggeredMenu.css'

function isExternal(link = '') {
  return /^https?:\/\//.test(link)
}

function getSocialIcon(label = '') {
  const key = label.trim().toLowerCase()
  if (key.includes('instagram')) return Instagram
  if (key.includes('linkedin')) return Linkedin
  if (key.includes('whatsapp')) return MessageCircle
  return MessageCircle
}

function StaggeredMenu({
  position = 'right',
  colors = ['#b19eef', '#5227ff'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className = '',
  menuButtonColor = '#fff',
  openMenuButtonColor = '#fff',
  accentColor = '#5227ff',
  changeMenuColorOnOpen = true,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
}) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const openRef = useRef(false)
  const panelRef = useRef(null)
  const preLayersRef = useRef(null)
  const preLayerElsRef = useRef([])
  const iconRef = useRef(null)
  const textInnerRef = useRef(null)
  const [textLines, setTextLines] = useState(['Menu', 'Close'])

  const openTlRef = useRef(null)
  const closeTweenRef = useRef(null)
  const spinTweenRef = useRef(null)
  const textCycleAnimRef = useRef(null)
  const colorTweenRef = useRef(null)
  const toggleBtnRef = useRef(null)

  useEffect(() => {
    if (!openRef.current) return
    openRef.current = false
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current
      const preContainer = preLayersRef.current
      const icon = iconRef.current
      const textInner = textInnerRef.current
      if (!panel || !icon || !textInner) return

      const preLayers = preContainer ? Array.from(preContainer.querySelectorAll('.smenu-prelayer')) : []
      preLayerElsRef.current = preLayers

      const offscreen = position === 'left' ? -100 : 100
      gsap.set([panel, ...preLayers], { xPercent: offscreen })
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' })
      gsap.set(textInner, { yPercent: 0 })
      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor })
    })
    return () => ctx.revert()
  }, [menuButtonColor, position])

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return null

    openTlRef.current?.kill()
    closeTweenRef.current?.kill()

    const itemEls = Array.from(panel.querySelectorAll('.smenu-panel-itemLabel'))
    const numberEls = Array.from(panel.querySelectorAll('.smenu-panel-list[data-numbering] .smenu-panel-item'))
    const socialTitle = panel.querySelector('.smenu-socials-title')
    const socialLinks = Array.from(panel.querySelectorAll('.smenu-socials-link'))

    const layerStates = layers.map((el) => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }))
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'))

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 })
    if (numberEls.length) gsap.set(numberEls, { '--smenu-num-opacity': 0 })
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 })
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 })

    const tl = gsap.timeline({ paused: true })
    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07)
    })
    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0)
    const panelDuration = 0.65
    tl.fromTo(panel, { xPercent: panelStart }, { xPercent: 0, duration: panelDuration, ease: 'power4.out' }, panelInsertTime)

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: 'power4.out',
          stagger: { each: 0.1, from: 'start' },
        },
        itemsStart,
      )
      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: 'power2.out',
            '--smenu-num-opacity': 1,
            stagger: { each: 0.08, from: 'start' },
          },
          itemsStart + 0.1,
        )
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4
      if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, socialsStart)
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' },
          },
          socialsStart + 0.04,
        )
      }
    }

    openTlRef.current = tl
    return tl
  }, [])

  const playOpen = useCallback(() => {
    const tl = buildOpenTimeline()
    tl?.play(0)
  }, [buildOpenTimeline])

  const playClose = useCallback(() => {
    openTlRef.current?.kill()
    openTlRef.current = null

    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return

    const all = [...layers, panel]
    closeTweenRef.current?.kill()
    const offscreen = position === 'left' ? -100 : 100
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
    })
  }, [position])

  const animateIcon = useCallback((opening) => {
    const icon = iconRef.current
    if (!icon) return
    spinTweenRef.current?.kill()
    spinTweenRef.current = gsap.to(icon, {
      rotate: 0,
      duration: opening ? 0.2 : 0.18,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }, [])

  const animateColor = useCallback(
    (opening) => {
      const btn = toggleBtnRef.current
      if (!btn) return
      colorTweenRef.current?.kill()
      const targetColor = changeMenuColorOnOpen
        ? opening
          ? openMenuButtonColor
          : menuButtonColor
        : menuButtonColor
      colorTweenRef.current = gsap.to(btn, {
        color: targetColor,
        duration: 0.3,
        ease: 'power2.out',
      })
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen],
  )

  const animateText = useCallback((opening) => {
    const inner = textInnerRef.current
    if (!inner) return
    textCycleAnimRef.current?.kill()

    const currentLabel = opening ? 'Menu' : 'Close'
    const targetLabel = opening ? 'Close' : 'Menu'
    const seq = [currentLabel, currentLabel === 'Menu' ? 'Close' : 'Menu', targetLabel, targetLabel]
    setTextLines(seq)

    gsap.set(inner, { yPercent: 0 })
    const lineCount = seq.length
    const finalShift = ((lineCount - 1) / lineCount) * 100
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: 'power4.out',
    })
  }, [])

  const closeMenu = useCallback(() => {
    if (!openRef.current) return
    openRef.current = false
    setOpen(false)
    onMenuClose?.()
    playClose()
    animateIcon(false)
    animateColor(false)
    animateText(false)
  }, [playClose, animateIcon, animateColor, animateText, onMenuClose])

  const toggleMenu = useCallback(() => {
    const target = !openRef.current
    openRef.current = target
    setOpen(target)
    if (target) {
      onMenuOpen?.()
      playOpen()
    } else {
      onMenuClose?.()
      playClose()
    }
    animateIcon(target)
    animateColor(target)
    animateText(target)
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose])

  useEffect(() => {
    if (!closeOnClickAway || !open) return undefined
    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target)
      ) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeOnClickAway, open, closeMenu])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, closeMenu])

  const preLayerColors = (colors?.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c']).filter(Boolean)

  return (
    <div
      className={`staggered-menu-wrapper ${className}`.trim()}
      style={{ '--smenu-accent': accentColor }}
      data-position={position}
      data-open={open || undefined}
    >
      <div ref={preLayersRef} className="smenu-prelayers" aria-hidden="true">
        {preLayerColors.map((c, i) => (
          <div key={`${c}-${i}`} className="smenu-prelayer" style={{ background: c }} />
        ))}
      </div>

      <button
        ref={toggleBtnRef}
        className="smenu-toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="staggered-menu-panel"
        onClick={toggleMenu}
        type="button"
      >
        <span className="smenu-toggle-textWrap" aria-hidden="true">
          <span ref={textInnerRef} className="smenu-toggle-textInner">
            {textLines.map((l, i) => (
              <span className="smenu-toggle-line" key={`${l}-${i}`}>
                {l}
              </span>
            ))}
          </span>
        </span>
        <span ref={iconRef} className="smenu-icon" aria-hidden="true">
          <span className="smenu-icon-line smenu-icon-line-top" />
          <span className="smenu-icon-line smenu-icon-line-mid" />
          <span className="smenu-icon-line smenu-icon-line-bottom" />
          <span className="smenu-icon-dot" />
        </span>
      </button>

      <aside id="staggered-menu-panel" ref={panelRef} className="staggered-menu-panel" aria-hidden={!open}>
        <div className="smenu-panel-inner">
          <button type="button" className="smenu-close-btn" onClick={closeMenu} aria-label="Close menu">
            <X size={18} />
          </button>
          <ul className="smenu-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
            {items.map((item, idx) => (
              <li className="smenu-panel-itemWrap" key={`${item.label}-${idx}`}>
                {isExternal(item.link) ? (
                  <a className="smenu-panel-item" href={item.link} target="_blank" rel="noreferrer" data-index={idx + 1}>
                    <span className="smenu-panel-itemLabel">{item.label}</span>
                  </a>
                ) : (
                  <Link className="smenu-panel-item" to={item.link} data-index={idx + 1} onClick={closeMenu}>
                    <span className="smenu-panel-itemLabel">{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {displaySocials && socialItems?.length > 0 && (
            <div className="smenu-socials" aria-label="Social links">
              <h3 className="smenu-socials-title">Socials</h3>
              <ul className="smenu-socials-list" role="list">
                {socialItems.map((s, i) => {
                  const Icon = getSocialIcon(s.label)
                  return (
                    <li key={`${s.label}-${i}`} className="smenu-socials-item">
                      <a href={s.link} target="_blank" rel="noreferrer" className="smenu-socials-link">
                        <span className="smenu-socials-icon" aria-hidden="true">
                          <Icon size={16} />
                        </span>
                        <span>{s.label}</span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </aside>

      {open && <button type="button" className="smenu-backdrop" aria-label="Close menu" onClick={closeMenu} />}
    </div>
  )
}

export default StaggeredMenu
