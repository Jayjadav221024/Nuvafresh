import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, Home, Sparkles, MapPin, CheckCircle2, ShieldCheck, 
  Navigation, Zap, Phone, Clock, Play, RotateCcw, Box, Check,
  Info, ChevronRight, Activity, Calendar
} from 'lucide-react';

const DEFAULT_STAGES = [
  { 
    id: 1, 
    pos: 5,
    title: 'Farm Harvest Allocated', 
    shortName: 'Farm Harvest',
    icon: '🌱',
    location: 'Gujarat Organic Cluster',
    actionDone: 'Fresh batch picked from certified soil',
    time: '08:30 AM', 
    date: 'Today',
    completed: true,
    details: 'Harvested under cold morning fog. Inspected for organic purity certification.'
  },
  { 
    id: 2, 
    pos: 24,
    title: '4-Stage Aqueous Ozone Wash', 
    shortName: 'O₃ Ozone Wash',
    icon: '💧',
    location: 'Purification Chamber A',
    actionDone: '99.9% chemical & pesticide removal',
    time: '10:15 AM', 
    date: 'Today',
    completed: true,
    details: 'Aqueous micro-bubble O₃ sterilization performed. 0.00 PPM chemical residue certified.'
  },
  { 
    id: 3, 
    pos: 43,
    title: 'Quality Lab Tested & Sealed', 
    shortName: 'Lab Tested & Sealed',
    icon: '🔬',
    location: 'Central QA Lab',
    actionDone: 'Zero-plastic biodegradable seal',
    time: '01:45 PM', 
    date: 'Today',
    completed: true,
    details: 'Passed 14-point purity spectrometer check. Packed in moisture-lock eco wrap.'
  },
  { 
    id: 4, 
    pos: 62,
    title: 'Dispatched with Sunrise Fleet', 
    shortName: 'EV Dispatch',
    icon: '🚚',
    location: 'Express Highway Corridor',
    actionDone: 'Loaded into insulated EV cold cargo',
    time: '04:20 PM', 
    date: 'Today',
    completed: true,
    details: 'EV temperature set to 18°C. Automated GPS tracking beacon initialized.'
  },
  { 
    id: 5, 
    pos: 81,
    title: 'Out for Delivery', 
    shortName: 'Local Street Route',
    icon: '🛵',
    location: 'Your Neighborhood Sector',
    actionDone: 'Courier Rajesh S. assigned for delivery',
    time: '07:30 AM', 
    date: 'Tomorrow',
    completed: false,
    details: 'Local courier on morning delivery round. Contactless doorstep handover protocol ready.'
  },
  { 
    id: 6, 
    pos: 100,
    title: 'Delivered Fresh to Doorstep', 
    shortName: 'Your Doorstep',
    icon: '🏡',
    location: 'Customer Residence',
    actionDone: 'Safe doorstep handover & verification',
    time: 'Est. 08:30 AM', 
    date: 'Tomorrow',
    completed: false,
    details: 'Fresh delivery verified. Pure nutrition delivered directly from farm to table.'
  }
];

const DeliveryRoadAnimation = ({ 
  currentStage = 4, // 1 to 6
  orderStatus = 'Dispatched', 
  carrier = 'Nuva Sunrise Eco-EV Fleet',
  driverName = 'Rajesh Solanki',
  vehicleNumber = 'GJ-06-EV-8821',
  estimatedTime = '18 mins away',
  customStages = null
}) => {
  // Merge custom stage data if passed from backend
  const milestones = (customStages && customStages.length > 0)
    ? DEFAULT_STAGES.map((def, idx) => {
        const custom = customStages[idx] || {};
        return {
          ...def,
          title: custom.title || def.title,
          actionDone: custom.description || def.actionDone,
          time: custom.time || def.time,
          completed: custom.completed !== undefined ? custom.completed : (idx + 1 <= currentStage)
        };
      })
    : DEFAULT_STAGES.map((def, idx) => ({
        ...def,
        completed: idx + 1 <= currentStage
      }));

  const activeStageIndex = Math.min(6, Math.max(1, currentStage));
  const targetProgress = milestones[activeStageIndex - 1]?.pos || 62;

  const [vanProgress, setVanProgress] = useState(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(38);
  const [chassisTilt, setChassisTilt] = useState(0); // degrees
  const [isPlayingSimulation, setIsPlayingSimulation] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(milestones[activeStageIndex - 1]);
  const [etaSeconds, setEtaSeconds] = useState(1080); // 18 mins

  const animRef = useRef(null);

  // Sync selected milestone when current stage changes
  useEffect(() => {
    setSelectedMilestone(milestones[activeStageIndex - 1]);
  }, [activeStageIndex]);

  // Smooth 60fps Initial Drive-In Animation with Quintic Ease-Out
  useEffect(() => {
    const duration = 1400; // 1.4s ultra smooth glide
    const startTime = performance.now();

    const animateDrive = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      
      // Quintic ease out for silky deceleration
      const eased = 1 - Math.pow(1 - t, 4);
      const currentVal = eased * targetProgress;
      setVanProgress(currentVal);

      // Dynamic tilt: slight forward tilt during glide, settling to 0
      const tilt = (1 - t) * 1.5;
      setChassisTilt(tilt);

      if (t < 1) {
        animRef.current = requestAnimationFrame(animateDrive);
      } else {
        setChassisTilt(0);
      }
    };

    animRef.current = requestAnimationFrame(animateDrive);
    return () => cancelAnimationFrame(animRef.current);
  }, [targetProgress]);

  // Live ETA countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setEtaSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatEta = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // Ultra-Smooth Physics Simulation with Acceleration, Cruise & Braking Curves
  const handleSimulateDrive = () => {
    if (isPlayingSimulation) return;
    setIsPlayingSimulation(true);
    setVanProgress(0);

    const startTime = performance.now();
    const duration = 4500; // 4.5s silky full journey

    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      
      // Smooth S-curve (cubic sine bezier interpolation)
      const eased = -(Math.cos(Math.PI * t) - 1) / 2;
      const currentPos = eased * 100;
      setVanProgress(currentPos);

      // Physics telemetry: speed in km/h based on derivative of position
      if (t < 0.2) {
        // Accelerating
        setCurrentSpeedKmh(Math.round(t * 5 * 45));
        setChassisTilt(2.2);
      } else if (t < 0.8) {
        // Cruising
        setCurrentSpeedKmh(44 + Math.round(Math.sin(t * 20) * 3));
        setChassisTilt(0.2);
      } else {
        // Gentle Braking
        setCurrentSpeedKmh(Math.max(0, Math.round((1 - t) * 5 * 45)));
        setChassisTilt(-1.8);
      }

      // Auto highlight milestones seamlessly as van passes them
      const matched = [...milestones].reverse().find(m => currentPos >= (m.pos - 8)) || milestones[0];
      setSelectedMilestone(matched);

      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setChassisTilt(0);
        setCurrentSpeedKmh(0);
        setTimeout(() => {
          setIsPlayingSimulation(false);
          setVanProgress(targetProgress);
          setCurrentSpeedKmh(38);
          setSelectedMilestone(milestones[activeStageIndex - 1]);
        }, 2000);
      }
    };

    animRef.current = requestAnimationFrame(step);
  };

  const isDelivered = vanProgress >= 98 || currentStage === 6;

  return (
    <div className="bg-gradient-to-b from-[#162a15] via-[#1f3b1e] to-[#122412] rounded-3xl p-5 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-emerald-800/40 font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER ROW */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
              Live Path Telemetry & Time Logs
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
            {isDelivered 
              ? '🎉 Fresh Produce Arrived at Your Doorstep!' 
              : vanProgress > 75 
              ? '🛵 Courier On Your Street (ETA: ' + formatEta(etaSeconds) + ')' 
              : '🚚 Temperature-Controlled EV Dispatched (18°C)'}
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleSimulateDrive}
            disabled={isPlayingSimulation}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-extrabold shadow-lg transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
            title="Watch smooth physics-animated vehicle traverse full road"
          >
            {isPlayingSimulation ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                <span>Simulating Journey...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Simulate Drive to Doorstep</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE COMPREHENSIVE ROADWAY PATH WITH ALL 6 MILESTONES & UPDATE TIMES */}
      {/* ========================================================================= */}
      <div className="relative my-6 pt-2 pb-2 overflow-hidden">
        <div className="w-full relative">
          
          {/* Top Row: Milestone Info Cards (Stage 1 to 6) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
              {milestones.map((m) => {
                const isSelected = selectedMilestone?.id === m.id;
                const isPastOrActive = vanProgress >= (m.pos - 5) || m.completed;

                return (
                  <div 
                    key={`top-${m.id}`}
                    onClick={() => setSelectedMilestone(m)}
                    className={`cursor-pointer transition-all duration-300 p-2.5 rounded-2xl border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/90 border-emerald-400 ring-2 ring-emerald-400/40 shadow-xl scale-102'
                        : isPastOrActive
                        ? 'bg-white/10 border-emerald-500/30 hover:bg-white/15'
                        : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* Top: Icon + Time Badge */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-base">{m.icon}</span>
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md ${
                        isPastOrActive 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-white/5 text-neutral-400'
                      }`}>
                        {m.time}
                      </span>
                    </div>

                    {/* Milestone Name */}
                    <h4 className="text-[11px] font-extrabold text-white leading-tight line-clamp-1">
                      {m.shortName}
                    </h4>

                    {/* What Done Action */}
                    <p className="text-[9px] text-neutral-300 line-clamp-2 mt-1 leading-snug">
                      {m.actionDone}
                    </p>

                    {/* Status Pill */}
                    <div className="mt-2 flex items-center gap-1">
                      {m.completed ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3 fill-emerald-500 text-neutral-950" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-neutral-400">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* THE CENTRAL PAVED HIGHWAY WITH MOVING EV VAN */}
            {/* ------------------------------------------------------------------- */}
            <div className="relative my-5">
              
              {/* Paved Asphalt Highway */}
              <div className="relative h-14 bg-neutral-950 rounded-2xl border-2 border-neutral-700/80 shadow-2xl flex items-center overflow-hidden">
                {/* Road Texture */}
                <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:8px_8px] opacity-40" />
                
                {/* Center Road Dash Lines */}
                <div className="w-full flex items-center justify-between px-3 gap-3">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="h-1 flex-1 bg-amber-400 rounded-full opacity-80 animate-pulse"
                      style={{ animationDelay: `${i * 90}ms` }}
                    />
                  ))}
                </div>

                {/* Road Curb Borders */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600/50" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600/50" />

                {/* Milestone Node Dots along the road surface */}
                <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none">
                  {milestones.map((m) => {
                    const isPassed = vanProgress >= (m.pos - 5) || m.completed;
                    return (
                      <div 
                        key={`dot-${m.id}`}
                        className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                          isPassed 
                            ? 'bg-emerald-400 border-white shadow-[0_0_10px_#10b981]' 
                            : 'bg-neutral-800 border-neutral-600'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* THE SMOOTH PHYSICS MOVING DELIVERY VEHICLE (EV VAN) */}
              {/* ----------------------------------------------------------------- */}
              <div 
                className="absolute -top-8 z-30 pointer-events-none -translate-x-1/2 flex flex-col items-center"
                style={{ 
                  left: `calc(4% + ${vanProgress * 0.92}%)`,
                  transform: `translateX(-50%) rotate(${chassisTilt}deg)`,
                  transition: isPlayingSimulation ? 'none' : 'left 0.4s cubic-bezier(0.25, 1, 0.5, 1), transform 0.2s ease-out'
                }}
              >
                {/* Floating Live Telemetry Tooltip with Speed and ETA */}
                <div className="mb-1.5 px-2.5 py-1 rounded-full bg-neutral-950/95 border border-emerald-400 shadow-2xl text-[10px] font-black text-white whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{isDelivered ? '✅ Delivered at Doorstep' : `Speed: ${currentSpeedKmh} km/h • ETA: ${formatEta(etaSeconds)}`}</span>
                </div>

                {/* Van Body */}
                <div className="relative">
                  {/* Electric Headlight Beam */}
                  {!isDelivered && (
                    <div 
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-9 bg-gradient-to-r from-amber-200/50 to-transparent blur-xs pointer-events-none rounded-r-full"
                      style={{ transform: 'translateX(80%) translateY(-50%)' }}
                    />
                  )}

                  <div className="w-14 h-11 bg-white rounded-xl shadow-2xl border-2 border-emerald-500 flex flex-col justify-between p-1 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-tighter text-[#2d472c] bg-emerald-100 px-1 rounded">
                        NUVA
                      </span>
                      <Zap className="h-2.5 w-2.5 text-emerald-600 fill-current" />
                    </div>

                    <div className="flex items-center justify-center text-xs">
                      {isDelivered ? '🎁' : '🥑'}
                    </div>

                    {/* Wheels with Realistic Spin */}
                    <div className="flex justify-between px-0.5 -mb-2">
                      <div className={`w-3.5 h-3.5 rounded-full bg-neutral-900 border-2 border-neutral-300 ${!isDelivered ? 'animate-spin' : ''}`} />
                      <div className={`w-3.5 h-3.5 rounded-full bg-neutral-900 border-2 border-neutral-300 ${!isDelivered ? 'animate-spin' : ''}`} />
                    </div>
                  </div>

                  {/* Sparkle Exhaust Trail */}
                  {!isDelivered && (
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-ping" />
                      <span className="w-1 h-1 rounded-full bg-lime-300/80" />
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ========================================================================= */}
      {/* 3. ACTIVE MILESTONE TELEMETRY DETAIL INSPECTOR */}
      {/* ========================================================================= */}
      {selectedMilestone && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md my-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl shrink-0 shadow-sm">
              {selectedMilestone.icon}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                  Stage {selectedMilestone.id} of 6 Telemetry
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono text-[10px] font-bold">
                  {selectedMilestone.time} ({selectedMilestone.date})
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                {selectedMilestone.title}
              </h4>
              <p className="text-xs text-neutral-200">
                {selectedMilestone.details}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
            <div className="text-right">
              <span className="block text-[10px] font-bold text-neutral-400 uppercase">Location Hub</span>
              <span className="text-xs font-bold text-emerald-300">{selectedMilestone.location}</span>
            </div>
            {selectedMilestone.completed ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-neutral-950 text-xs font-extrabold flex items-center gap-1 shadow-md">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>Verified</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-white/10 text-neutral-300 text-xs font-bold border border-white/20">
                In Queue
              </span>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. COURIER TELEMETRY & AGENT CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
        
        {/* Telemetry 1: Driver & Vehicle */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-emerald-300/80 uppercase tracking-wider">Fleet Partner</span>
            <p className="text-xs font-bold text-white truncate">{driverName}</p>
            <p className="text-[10px] font-mono text-neutral-300 truncate">{vehicleNumber}</p>
          </div>
        </div>

        {/* Telemetry 2: Temperature Controlled Eco-Cargo */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-cyan-300/80 uppercase tracking-wider">Cold-Chain State</span>
            <p className="text-xs font-bold text-white">Aqueous O₃ Insulated</p>
            <p className="text-[10px] text-emerald-400 font-semibold">18°C Optimal Freshness</p>
          </div>
        </div>

        {/* Telemetry 3: Live Direct Agent Connect */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-amber-300/80 uppercase tracking-wider">Doorstep Handover</span>
            <p className="text-xs font-bold text-white">Contactless Safe Delivery</p>
            <p className="text-[10px] text-neutral-300">Zero-plastic sealed</p>
          </div>
          <a
            href="tel:+919227725359"
            className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-transform active:scale-95 shadow-md shrink-0"
            title="Call Delivery Fleet"
          >
            <Phone className="h-4 w-4 stroke-[2.5]" />
          </a>
        </div>

      </div>

    </div>
  );
};

export default DeliveryRoadAnimation;
