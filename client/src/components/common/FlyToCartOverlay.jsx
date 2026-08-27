import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Star } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

// Ultra-Smooth Cubic Bezier ease function
const easeOutQuad = (t) => t * (2 - t);
const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
const easeInQuad = (t) => t * t;

const PhysicsFlyingItem = ({ item, onComplete }) => {
  const [pos, setPos] = useState({
    x: item.startX,
    y: item.startY,
    scale: 1,
    rotation: 0,
    rotationY: 0,
    opacity: 1,
    shadowBlur: 20
  });

  const [trails, setTrails] = useState([]);
  const animRef = useRef(null);
  const startTimeRef = useRef(null);

  const duration = 820; // 820ms butter-smooth flight duration

  // Arc height calculation based on distance
  const distance = Math.hypot(item.endX - item.startX, item.endY - item.startY);
  const arcHeight = Math.min(180, Math.max(90, distance * 0.22));

  useEffect(() => {
    let lastTrailTime = 0;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const rawT = Math.min(1, elapsed / duration);

      // Smooth progress curve
      const t = easeInOutCubic(rawT);

      // Horizontal linear-eased interpolation
      const currentX = item.startX + (item.endX - item.startX) * t;

      // Vertical parabolic arc (rises up first, then accelerates down into cart)
      const baseVertical = item.startY + (item.endY - item.startY) * t;
      const arcOffset = arcHeight * Math.sin(t * Math.PI); // Parabolic lift
      const currentY = baseVertical - arcOffset;

      // Dynamic scale: lifts up (1 -> 1.1), then shrinks into cart (1.1 -> 0.12)
      let scale = 1;
      if (rawT < 0.2) {
        scale = 1 + rawT * 0.6; // Scale up to 1.12
      } else {
        const shrinkT = (rawT - 0.2) / 0.8;
        scale = 1.12 - shrinkT * 0.98; // Shrink to 0.14
      }

      // Dynamic 3D tilt & spin
      const rotation = rawT * 380; // 1 full spin
      const rotationY = Math.sin(rawT * Math.PI) * 35; // 3D perspective wobble

      // Opacity: stays crisp until final 10% absorption into basket
      const opacity = rawT > 0.88 ? 1 - (rawT - 0.88) / 0.12 : 1;
      const shadowBlur = Math.max(5, 30 * (1 - rawT));

      setPos({
        x: currentX,
        y: currentY,
        scale: Math.max(0.1, scale),
        rotation,
        rotationY,
        opacity,
        shadowBlur
      });

      // Spawn trailing particle stars every ~70ms during flight
      if (elapsed - lastTrailTime > 65 && rawT < 0.85) {
        lastTrailTime = elapsed;
        setTrails((prev) => [
          ...prev.slice(-6), // Keep max 6 active trail particles
          {
            id: Math.random(),
            x: currentX + (Math.random() - 0.5) * 16,
            y: currentY + (Math.random() - 0.5) * 16,
            scale: scale * 0.7,
            opacity: 0.85
          }
        ]);
      }

      if (rawT < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        onComplete(item.id);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [item, duration, arcHeight, onComplete]);

  return (
    <>
      {/* Magic Stardust Trail Particles */}
      {trails.map((trail) => (
        <div
          key={trail.id}
          className="fixed pointer-events-none z-[999998] transition-all duration-500"
          style={{
            left: trail.x - 6,
            top: trail.y - 6,
            transform: `scale(${trail.scale})`,
            opacity: trail.opacity,
            animation: 'flySparkle 0.5s ease-out forwards'
          }}
        >
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 shadow-[0_0_8px_#34d399] animate-ping" />
        </div>
      ))}

      {/* Main Flying Product Card / Thumbnail */}
      <div
        className="fixed pointer-events-none z-[999999] will-change-transform"
        style={{
          left: pos.x - 42,
          top: pos.y - 42,
          width: 84,
          height: 84,
          transform: `translate3d(0, 0, 0) scale(${pos.scale}) rotate(${pos.rotation}deg) rotateY(${pos.rotationY}deg)`,
          opacity: pos.opacity,
          perspective: 1000
        }}
      >
        <div 
          className="relative w-full h-full rounded-2xl bg-white p-2 border-2 border-emerald-500 overflow-hidden flex items-center justify-center"
          style={{
            boxShadow: `0 12px ${pos.shadowBlur}px rgba(45, 71, 44, 0.45), 0 0 20px rgba(52, 211, 153, 0.4)`
          }}
        >
          <img
            src={item.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500'}
            alt="Flying Item"
            className="w-full h-full object-contain rounded-xl drop-shadow-sm select-none"
          />

          {/* Glowing Green Overlay Sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-amber-300/20 rounded-2xl pointer-events-none" />

          {/* Sparkle Badge */}
          <div className="absolute top-1 right-1 text-emerald-600 bg-white/90 rounded-full p-0.5 shadow-xs">
            <Sparkles className="h-3 w-3" />
          </div>
        </div>
      </div>
    </>
  );
};

const FlyToCartOverlay = () => {
  const { flyingItems, removeFlyingItem } = useCart();

  if (!flyingItems || flyingItems.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden">
      {flyingItems.map((item) => (
        <PhysicsFlyingItem
          key={item.id}
          item={item}
          onComplete={removeFlyingItem}
        />
      ))}
    </div>
  );
};

export default FlyToCartOverlay;
