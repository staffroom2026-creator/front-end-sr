import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import teacherImg from '../assets/teacher-role.webp';
import adminImg from '../assets/admin-role.webp';
import BrandLogo from '../components/BrandLogo';

/* ── Animation variants ── */
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.45, ease: 'easeOut', staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const slideUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] },
  }),
};

const roles = [
  {
    id: 'teacher',
    label: 'Teacher',
    description: 'Find verified teaching jobs, tutoring opportunities, and career growth tools.',
    image: teacherImg,
  },
  {
    id: 'admin',
    label: 'School/Administrator',
    description: 'Hire qualified teachers faster with structured recruitment.',
    image: adminImg,
  },
];

export default function UserType() {
  const [selected, setSelected]   = useState('teacher');
  const [focusedIdx, setFocusedIdx] = useState(0); // which card is in the spotlight on mobile
  const navigate   = useNavigate();
  const trackRef   = useRef(null);   // the scrollable .ut-cards div
  const cardRefs   = useRef([]);     // refs for each card button
  const isMobile   = useRef(false);

  /* ── Detect mobile breakpoint ── */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    isMobile.current = mq.matches;
    const onChange = (e) => { isMobile.current = e.matches; };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  /* ── Scroll listener: find which card centre is closest to track centre ── */
  const handleScroll = useCallback(() => {
    if (!isMobile.current || !trackRef.current) return;
    const track      = trackRef.current;
    const trackCX    = track.scrollLeft + track.clientWidth / 2;
    let   closest    = 0;
    let   minDist    = Infinity;

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const cardCX = card.offsetLeft + card.offsetWidth / 2;
      const dist   = Math.abs(trackCX - cardCX);
      if (dist < minDist) { minDist = dist; closest = i; }
    });

    setFocusedIdx(closest);
    setSelected(roles[closest].id);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /* ── Tap a card on mobile → smooth-scroll it to centre ── */
  const handleCardClick = (role, i) => {
    setSelected(role.id);
    if (isMobile.current && cardRefs.current[i] && trackRef.current) {
      const track  = trackRef.current;
      const card   = cardRefs.current[i];
      const target = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
      track.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  /* ── Derive per-card spotlight style on mobile ── */
  const cardStyle = (i) => {
    if (!isMobile.current) return {};           // desktop: no dimming
    const isFocused = i === focusedIdx;
    return {
      opacity:   isFocused ? 1 : 0.38,
      filter:    isFocused ? 'blur(0px)' : 'blur(2.5px)',
      transform: isFocused ? 'scale(1)' : 'scale(0.92)',
      transition: 'opacity 0.35s ease, filter 0.35s ease, transform 0.35s ease',
    };
  };

  return (
    <motion.div
      className="ut-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Top Logo ── */}
      <motion.header className="ut-header" variants={slideUp}>
        <Link to="/" className="ut-logo">
          <BrandLogo />
        </Link>
        <button onClick={() => navigate(-1)} className="ut-back-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
      </motion.header>

      {/* ── Main Content ── */}
      <main className="ut-main">

        {/* Heading */}
        <motion.h1 className="ut-heading" variants={slideUp}>
          Choose your role and we'll tailor your experience.
        </motion.h1>

        {/* ── Role Cards ── */}
        <div className="ut-cards" id="role-cards-container" ref={trackRef}>
          {roles.map((role, i) => {
            const isActive = selected === role.id;
            return (
              <motion.button
                key={role.id}
                id={`role-${role.id}`}
                ref={(el) => (cardRefs.current[i] = el)}
                className={`ut-card ${isActive ? 'ut-card--active' : ''}`}
                onClick={() => handleCardClick(role, i)}
                custom={i}
                variants={cardVariants}
                whileHover={{ y: -4, boxShadow: '0 14px 36px rgba(0,0,0,0.13)' }}
                whileTap={{ scale: 0.97 }}
                style={cardStyle(i)}
              >
                {/* Full-cover image */}
                <div className="ut-card-img-wrap">
                  <motion.img
                    src={role.image}
                    alt={role.label}
                    className="ut-card-img"
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="ut-card-shimmer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Text body */}
                <div className="ut-card-body">
                  <div className="ut-card-title-row">
                    <p className="ut-card-title">{role.label}</p>
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          className="ut-check"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="7" r="7" fill="#1CCB43" />
                            <path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.6"
                              strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="ut-card-desc">{role.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* ── Next Button ── */}
        <motion.button
          id="usertype-next-btn"
          className="ut-next-btn"
          onClick={() => {
            if (selected === 'teacher') {
              navigate('/teacher-info');
            } else {
              navigate('/sch-info');
            }
          }}
          variants={slideUp}
          whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(28,203,67,0.35)' }}
          whileTap={{ scale: 0.96 }}
        >
          Next
        </motion.button>

        {/* ── Pagination dots ── */}
        <motion.div className="ut-dots" variants={slideUp}>
          <span className="ut-dot ut-dot--active" />
          <span className="ut-dot" />
        </motion.div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .ut-page {
          min-height: 100vh;
          background-color: #F0F0EE;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── Header ── */
        .ut-header { 
          padding: 24px 40px; 
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ut-back-btn {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #718096;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
        }

        .ut-back-btn:hover {
          color: #111;
        }

        .ut-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #111;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: -0.4px;
        }

        /* ── Main ── */
        .ut-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px 24px 60px;
          gap: 40px;
        }

        /* ── Heading ── */
        .ut-heading {
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 600;
          color: #111;
          text-align: center;
          letter-spacing: -0.5px;
          line-height: 1.3;
          max-width: 680px;
          margin: 0;
        }

        /* ── Cards Row (desktop) ── */
        .ut-cards {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
        }

        /* ── Single Card ── */
        .ut-card {
          width: 240px;
          background: #fff;
          border-radius: 16px;
          border: 2.5px solid transparent;
          padding: 0;
          cursor: pointer;
          text-align: left;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          transition: border-color 0.25s;
          outline: none;
          position: relative;
        }

        .ut-card--active { border-color: #1CCB43; }

        /* ── Card Image — full cover ── */
        .ut-card-img-wrap {
          position: relative;
          width: 100%;
          height: 180px;
          overflow: hidden;
        }

        .ut-card-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }

        .ut-card-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(28,203,67,0.18) 0%, transparent 60%);
          pointer-events: none;
        }

        /* ── Card Text ── */
        .ut-card-body { padding: 14px 16px 18px; }

        .ut-card-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .ut-card-title { font-size: 15px; font-weight: 700; color: #111; margin: 0; }
        .ut-check      { display: inline-flex; flex-shrink: 0; }
        .ut-card-desc  { font-size: 13px; color: #555; margin: 0; line-height: 1.5; }

        /* ── Next Button ── */
        .ut-next-btn {
          width: 100%;
          max-width: 320px;
          padding: 18px;
          background: #1CCB43;
          color: #111;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          letter-spacing: 0.2px;
          transition: background 0.2s;
        }
        .ut-next-btn:hover { background: #17b83b; }

        /* ── Dots ── */
        .ut-dots { display: flex; gap: 8px; align-items: center; }

        .ut-dot {
          height: 8px;
          width: 8px;
          border-radius: 50%;
          background-color: #CBD5E0;
          display: block;
        }

        .ut-dot--active {
          background-color: #2D3748;
        }

        /* ───────────────────────────────────────────
           MOBILE — horizontal carousel with spotlight
           ─────────────────────────────────────────── */
        @media (max-width: 640px) {
          .ut-header { padding: 20px 24px; }

          .ut-main {
            padding: 16px 0 60px;
            gap: 32px;
          }

          .ut-heading { padding: 0 24px; }

          /* Scroll track — centre-aligned snap */
          .ut-cards {
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: visible;
            justify-content: flex-start;
            gap: 16px;
            /* equal side-padding = half the empty space, centres first/last card */
            padding: 12px 18vw 20px;
            scroll-snap-type: x mandatory;
            scroll-padding-inline: 18vw;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .ut-cards::-webkit-scrollbar { display: none; }

          /* Cards snap to centre */
          .ut-card {
            flex: 0 0 68vw;
            max-width: 300px;
            min-width: 200px;
            scroll-snap-align: center;
            /* opacity/blur/scale are driven by inline style from JS */
            will-change: opacity, filter, transform;
          }

          .ut-next-btn {
            margin: 0 24px;
            width: calc(100% - 48px);
          }

          .ut-dots { margin-bottom: 8px; }
        }
      `}</style>
    </motion.div>
  );
}
