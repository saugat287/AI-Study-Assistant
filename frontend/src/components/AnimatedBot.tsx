import { motion, useAnimation, animate, MotionValue } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

export function AnimatedBot({ charX }: { charX: MotionValue<number> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation(); // Used for other transforms like jumping
  const [facing, setFacing] = useState<'right' | 'left'>('right');
  const [isWalking, setIsWalking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isWaving, setIsWaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    const sequence = async () => {
      // Small pause before starting
      await new Promise(r => setTimeout(r, 500));
      
      while (isActive) {
        // Measure dynamically every loop so it responds to window resizes
        const parentWidth = containerRef.current?.parentElement?.offsetWidth || 300;
        const isMobile = window.innerWidth < 640;
        // On desktop, the font size (text-5xl) is much larger, meaning the emoji takes up more space!
        // We stop earlier on desktop to prevent running over the massive emoji.
        const offset = isMobile ? 90 : 140; 
        const rightEdge = parentWidth - offset;

        // Turn right, pause briefly
        setFacing('right');
        await new Promise(r => setTimeout(r, 200));
        
        // Walk Right
        setIsWalking(true);
        await animate(charX, rightEdge, { duration: 6.5, ease: "linear" });
        if (!isActive) break;

        // Stop at right edge and wave at the emoji
        setIsWalking(false);
        setIsWaving(true);
        await new Promise(r => setTimeout(r, 2500));
        setIsWaving(false);
        if (!isActive) break;

        // Turn left, pause briefly before walking
        setFacing('left');
        await new Promise(r => setTimeout(r, 400));
        
        // Walk Left (exactly to the 'G')
        setIsWalking(true);
        await animate(charX, 0, { duration: 6.5, ease: "linear" });
        if (!isActive) break;

        // Stop at left edge, look around
        setIsWalking(false);
        await new Promise(r => setTimeout(r, 1500));
        if (!isActive) break;
      }
    };
    
    sequence();

    return () => {
      isActive = false;
      controls.stop();
    };
  }, [charX, controls]);

  // The CSS classes determine the animation state
  const stateClass = isWaving ? 'state-waving' : (isJumping ? 'state-jumping' : (isWalking ? 'state-walking' : 'state-idle'));

  return (
    <div ref={containerRef} className="relative w-full h-full pointer-events-none flex items-end">
      
      {/* 
        BULLETPROOF CSS ANIMATIONS 
        No SVG transform-origin bugs! Guaranteed to stay attached. 
      */}
      <style>{`
        /* Walk Cycle Keyframes (0.8s duration) - Smooth eased motion */
        @keyframes walkThighFront {
          0% { transform: rotate(35deg); }
          50% { transform: rotate(-35deg); }
          100% { transform: rotate(35deg); }
        }
        @keyframes walkCalfFront {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(0deg); }
          50% { transform: rotate(10deg); }
          75% { transform: rotate(50deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes walkThighBack {
          0% { transform: rotate(-35deg); }
          50% { transform: rotate(35deg); }
          100% { transform: rotate(-35deg); }
        }
        @keyframes walkCalfBack {
          0% { transform: rotate(10deg); }
          25% { transform: rotate(50deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(0deg); }
          100% { transform: rotate(10deg); }
        }
        @keyframes walkArmFront {
          0% { transform: rotate(-35deg); }
          50% { transform: rotate(35deg); }
          100% { transform: rotate(-35deg); }
        }
        @keyframes walkArmBack {
          0% { transform: rotate(35deg); }
          50% { transform: rotate(-35deg); }
          100% { transform: rotate(35deg); }
        }
        @keyframes bodyBob {
          0% { transform: translateY(6px); }
          25% { transform: translateY(0px); }
          50% { transform: translateY(6px); }
          75% { transform: translateY(0px); }
          100% { transform: translateY(6px); }
        }

        /* Jumping Keyframes */
        @keyframes jumpThighFront { 0%, 100% { transform: rotate(-60deg); } }
        @keyframes jumpCalfFront { 0%, 100% { transform: rotate(80deg); } }
        @keyframes jumpThighBack { 0%, 100% { transform: rotate(-30deg); } }
        @keyframes jumpCalfBack { 0%, 100% { transform: rotate(90deg); } }
        @keyframes jumpArmFront { 0%, 100% { transform: rotate(-140deg); } }
        @keyframes jumpArmBack { 0%, 100% { transform: rotate(-120deg); } }
        @keyframes jumpTorso { 0%, 100% { transform: rotate(15deg); } }
        @keyframes jumpHead { 0%, 100% { transform: rotate(-15deg); } }

        /* Waving Keyframes */
        @keyframes waveArmFront {
          0% { transform: rotate(-100deg); }
          50% { transform: rotate(-160deg); }
          100% { transform: rotate(-100deg); }
        }

        /* Cyberpunk Sci-Fi Custom Keyframes */
        @keyframes scan {
          0% { transform: translateX(-5px); }
          100% { transform: translateX(35px); }
        }
        @keyframes floatBag {
          0%, 100% { transform: translateY(0) rotate(5deg); }
          50% { transform: translateY(-8px) rotate(-2deg); }
        }
        .bag-float { animation: floatBag 3s infinite ease-in-out; }

        /* Apply Animations with easing for smooth fluid realism */
        .state-walking .joint-thigh-front { animation: walkThighFront 0.8s infinite ease-in-out; }
        .state-walking .joint-calf-front { animation: walkCalfFront 0.8s infinite ease-in-out; }
        .state-walking .joint-thigh-back { animation: walkThighBack 0.8s infinite ease-in-out; }
        .state-walking .joint-calf-back { animation: walkCalfBack 0.8s infinite ease-in-out; }
        .state-walking .joint-arm-front { animation: walkArmFront 0.8s infinite ease-in-out; }
        .state-walking .joint-arm-back { animation: walkArmBack 0.8s infinite ease-in-out; }
        .state-walking .body-bob { animation: bodyBob 0.8s infinite ease-in-out; }
        .state-walking .joint-torso { transform: rotate(5deg); transition: transform 0.2s ease-in-out; }
        .state-walking .joint-head { transform: rotate(0deg); transition: transform 0.2s ease-in-out; }

        .state-waving .joint-arm-front { animation: waveArmFront 0.5s infinite ease-in-out; }
        .state-waving .joint-torso, .state-waving .joint-head, .state-waving .body-bob { 
          transition: transform 0.3s ease-in-out; transform: translateY(0) rotate(0); 
        }
        .state-waving .joint-thigh-front, .state-waving .joint-thigh-back,
        .state-waving .joint-calf-front, .state-waving .joint-calf-back,
        .state-waving .joint-arm-back {
          transition: transform 0.3s ease-in-out; transform: rotate(0);
        }

        .state-jumping .joint-thigh-front { animation: jumpThighFront 1.2s forwards ease-in-out; }
        .state-jumping .joint-calf-front { animation: jumpCalfFront 1.2s forwards ease-in-out; }
        .state-jumping .joint-thigh-back { animation: jumpThighBack 1.2s forwards ease-in-out; }
        .state-jumping .joint-calf-back { animation: jumpCalfBack 1.2s forwards ease-in-out; }
        .state-jumping .joint-arm-front { animation: jumpArmFront 1.2s forwards ease-in-out; }
        .state-jumping .joint-arm-back { animation: jumpArmBack 1.2s forwards ease-in-out; }
        .state-jumping .joint-torso { animation: jumpTorso 1.2s forwards ease-in-out; }
        .state-jumping .joint-head { animation: jumpHead 1.2s forwards ease-in-out; }
        
        /* Reset to idle smoothly */
        .state-idle .joint-torso, .state-idle .joint-head, .state-idle .body-bob { 
          transition: transform 0.3s ease-in-out; transform: translateY(0) rotate(0); 
        }
        .state-idle .joint-thigh-front, .state-idle .joint-thigh-back,
        .state-idle .joint-calf-front, .state-idle .joint-calf-back,
        .state-idle .joint-arm-front, .state-idle .joint-arm-back {
          transition: transform 0.3s ease-in-out; transform: rotate(0);
        }
      `}</style>

      {/* 3D Floor Shadow */}
      <motion.div
        className="absolute bottom-[0px] w-[50px] h-[10px] bg-black/60 blur-[4px] rounded-full ml-[10px]"
        style={{ 
          x: charX, // Bind directly to the shared MotionValue
          scale: isJumping ? 0.3 : 1, 
          opacity: isJumping ? 0.1 : 0.8 
        }}
      />

      {/* Main Character Wrapper - DRASTICALLY SMALLER SIZE */}
      <motion.div
        className="relative w-[70px] h-[85px] z-[10]"
        style={{ 
          x: charX, // Bind directly to the shared MotionValue
          transformOrigin: "bottom center" 
        }}
      >
        <div 
          className={`w-full h-full relative ${stateClass}`}
          style={{ 
            // translateX(-27px) perfectly centers the physical feet over the transform-origin
            transform: facing === 'left' ? 'scaleX(-0.6) scaleY(0.6) translateX(-27px)' : 'scaleX(0.6) scaleY(0.6) translateX(-27px)',
            transformOrigin: "bottom center",
            transition: 'transform 0.2s ease-in-out'
          }}
        >
          {/* Bobbing Body Wrapper */}
          <motion.div 
            animate={controls} // Uses controls for JUMPING Y and ROTATE ONLY
            className="body-bob w-full h-full relative" 
            style={{ transformOrigin: 'bottom center' }}
          >
            
            {/* ========================================================= */}
            {/* HTML DOM RIG: CYBERPUNK SCHOOL BOY                        */}
            {/* ========================================================= */}

            {/* BACK LEG (Dark Cyber Pants & Sneaker) */}
            <div className="joint-thigh-back absolute left-[60px] top-[80px] w-[18px] h-[28px] z-[1]" style={{ transformOrigin: 'top center' }}>
              <div className="w-full h-full bg-[#111827] rounded-full border-[2px] border-black overflow-hidden">
                <div className="absolute top-1/2 w-full h-[2px] bg-cyan-500/30" />
              </div>
              {/* Back Calf */}
              <div className="joint-calf-back absolute left-[1px] top-[18px] w-[14px] h-[30px]" style={{ transformOrigin: 'top center' }}>
                <div className="w-full h-[22px] bg-[#111827] rounded-full border-[2px] border-black" />
                {/* Cyber Sneaker */}
                <div className="absolute bottom-[-2px] left-[-6px] w-[22px] h-[14px] bg-white rounded-[6px] border-[2px] border-black overflow-hidden">
                  <div className="absolute bottom-0 w-full h-[4px] bg-cyan-400" style={{ boxShadow: '0 0 8px #22d3ee' }} />
                </div>
              </div>
            </div>

            {/* TORSO AND UPPER BODY */}
            <div className="joint-torso absolute left-[40px] top-[48px] w-[40px] h-[46px] z-[10]" style={{ transformOrigin: 'bottom center' }}>
              
              {/* Anti-Gravity Backpack (Attached to Back of Torso) */}
              <div className="bag-float absolute left-[20px] top-[-10px] w-[45px] h-[55px] bg-[#0f172a] rounded-[10px] border-[2px] border-cyan-500 z-[-2]" style={{ boxShadow: '0 0 15px rgba(6, 182, 212, 0.5)' }}>
                {/* Glowing Core */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20px] h-[20px] rounded-full bg-cyan-300" style={{ boxShadow: '0 0 20px #67e8f9, inset 0 0 10px #fff' }} />
                {/* Energy Straps connecting to torso */}
                <div className="absolute left-[-15px] top-[5px] w-[20px] h-[4px] bg-cyan-500/80 rotate-[-15deg]" />
                <div className="absolute left-[-10px] bottom-[10px] w-[15px] h-[4px] bg-cyan-500/80 rotate-[15deg]" />
              </div>
              
              {/* Back Arm */}
              <div className="joint-arm-back absolute left-[20px] top-[8px] w-[14px] h-[26px] z-[-1]" style={{ transformOrigin: 'top center' }}>
                <div className="w-full h-[22px] bg-indigo-900 rounded-full border-[2px] border-black" />
                {/* Cyber Glove */}
                <div className="absolute bottom-[-2px] left-[1px] w-[12px] h-[12px] bg-gray-800 rounded-md border-[2px] border-cyan-400" />
              </div>

              {/* Sci-Fi Jacket */}
              <div className="w-full h-full bg-indigo-900 rounded-[12px] border-[2px] border-black drop-shadow-lg overflow-hidden">
                <div className="absolute top-[10px] right-[-5px] w-[20px] h-[40px] bg-fuchsia-600 rotate-45" />
                <div className="absolute left-[10px] top-0 w-[4px] h-full bg-cyan-400/50" />
                <div className="absolute bottom-0 w-full h-[6px] bg-cyan-400/80" style={{ boxShadow: '0 0 10px #22d3ee' }} />
              </div>
              
              {/* Head */}
              <div className="joint-head absolute left-[-4px] top-[-44px] w-[50px] h-[50px]" style={{ transformOrigin: 'bottom center' }}>
                {/* Anime Hair - Spiky Golden/Blonde */}
                <div className="absolute top-[-15px] left-[-10px] w-[60px] h-[30px] z-[-1]">
                   <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-md">
                      <path d="M 0 50 Q 10 10 30 20 Q 35 0 50 15 Q 70 -5 80 25 Q 95 10 100 50 Z" fill="#facc15" stroke="#000" strokeWidth="3" />
                   </svg>
                </div>
                
                {/* Face Outline */}
                <div className="w-full h-full bg-[#fca5a5] rounded-full border-[2px] border-black flex items-center justify-center overflow-hidden drop-shadow-md">
                  {/* Cyber Visor covering eyes */}
                  <div className="absolute top-[12px] right-[-2px] w-[35px] h-[14px] bg-black rounded-l-md border-[2px] border-cyan-500 overflow-hidden" style={{ boxShadow: '0 0 12px #06b6d4' }}>
                     {/* Scanning Laser Animation */}
                     <div className="w-[4px] h-full bg-white opacity-80" style={{ animation: 'scan 1.5s infinite linear' }} />
                  </div>
                  {/* Cyber Ear piece */}
                  <div className="absolute left-[0px] top-[15px] w-[10px] h-[16px] bg-gray-800 rounded-r-md border-[2px] border-fuchsia-500" />
                </div>
              </div>

              {/* Front Arm */}
              <div className="joint-arm-front absolute left-[10px] top-[8px] w-[16px] h-[30px] z-[20]" style={{ transformOrigin: 'top center' }}>
                <div className="w-full h-[26px] bg-indigo-800 rounded-full border-[2px] border-black drop-shadow-md overflow-hidden">
                   <div className="absolute left-[4px] top-[5px] w-[2px] h-[10px] bg-cyan-400" />
                </div>
                {/* Cyber Glove */}
                <div className="absolute bottom-[-2px] left-[2px] w-[12px] h-[12px] bg-gray-800 rounded-md border-[2px] border-cyan-400" style={{ boxShadow: '0 0 5px #22d3ee' }} />
              </div>

            </div>

            {/* FRONT LEG (Lighter Pants & Sneaker) */}
            <div className="joint-thigh-front absolute left-[45px] top-[80px] w-[20px] h-[28px] z-[30]" style={{ transformOrigin: 'top center' }}>
              <div className="w-full h-full bg-[#1f2937] rounded-full border-[2px] border-black drop-shadow-md overflow-hidden">
                 <div className="absolute top-1/2 w-full h-[2px] bg-cyan-500/50" />
              </div>
              {/* Front Calf */}
              <div className="joint-calf-front absolute left-[2px] top-[18px] w-[16px] h-[30px]" style={{ transformOrigin: 'top center' }}>
                <div className="w-full h-[22px] bg-[#1f2937] rounded-full border-[2px] border-black" />
                {/* Cyber Sneaker */}
                <div className="absolute bottom-[-2px] left-[-4px] w-[22px] h-[14px] bg-white rounded-[6px] border-[2px] border-black overflow-hidden drop-shadow-md">
                  <div className="absolute top-[2px] left-[4px] w-[8px] h-[4px] bg-fuchsia-500 rounded-sm" />
                  <div className="absolute bottom-0 w-full h-[4px] bg-cyan-400" style={{ boxShadow: '0 0 8px #22d3ee' }} />
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
