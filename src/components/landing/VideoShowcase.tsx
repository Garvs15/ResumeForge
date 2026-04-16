// "use client";

// import { Maximize2, Play } from "lucide-react";
// import { useEffect, useRef, useState } from "react";

// export function VideoShowcase() {
//     const videoRef = useRef<HTMLVideoElement>(null);
//     const [isPlaying, setIsPlaying] = useState(false);

//     const togglePlay = () => {
//         if (videoRef.current) {
//             if (isPlaying) {
//                 videoRef.current.pause();
//             } else {
//                 videoRef.current.play();
//             }
//             setIsPlaying(!isPlaying);
//         }
//     }

//     const toggleFullScreen = () => {
//         if (videoRef.current) {
//             if (!document.fullscreenElement) {
//                 videoRef.current.requestFullscreen().catch(err => {
//                     console.error(`Error attempting to enable fullscreen: ${err.message}`);
//                 })
//             } else {
//                 document.exitFullscreen();
//             }
//         }
//     }

//     useEffect(() => {
//         const handleVideoEnd = () => {
//             setIsPlaying(false);
//         }

//         const video = videoRef.current;
//         if (video) {
//             video.addEventListener('ended', handleVideoEnd);
//         }

//         return () => {
//             if (video) {
//                 video.removeEventListener('ended', handleVideoEnd);
//             }
//         }
//     }, []);

//     return (
//         <section className="py-16 md:py-24 px-4 relative overflow-hidden" id="how-it-works">
//             {/* Simplified background elements */}
//             <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-teal-100/10"></div>
//             <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-indigo-100/10"></div>

//             <div className="container mx-auto max-w-6xl">
//                 {/* Section Header */}
//                 <div className="text-center mb-12 relative z-10">
//                     <h2 className="text-3xl md:text-4xl font-bold mb-4 text-teal-600">
//                         See ResumeForge in Action
//                     </h2>
//                     <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//                         Watch how our AI-powered platform transforms your resume in minutes
//                     </p>
//                 </div>

//                 {/* Video container with simplified styling */}
//                 <div className="relative mx-auto group">
//                     {/* Simplified card effect container */}
//                     <div className="relative rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg z-10">
//                         {/* Video Placeholder */}
//                         <div className="relative aspect-video w-full cursor-pointer"
//                             onClick={togglePlay}
//                         >
//                             <video
//                                 ref={videoRef}
//                                 className="w-full h-full object-cover rounded-2xl"
//                                 src="/ResumeForge.mp4"
//                                 poster="/thumbnail.png"
//                                 onEnded={() => setIsPlaying(false)}
//                             />

//                             {/* Simplified overlay for thumbnail */}
//                             {!isPlaying && (
//                                 <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
//                             )}

//                             {/* Play button - Only shows when video is paused */}
//                             {!isPlaying && (
//                                 <button
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         togglePlay();
//                                     }}
//                                     className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-indigo-600 text-white transition-all duration-300 hover:scale-110 z-20"
//                                     aria-label="Play video"
//                                 >
//                                     <Play className="h-8 w-8 ml-1" />
//                                 </button>
//                             )}

//                             {/* Controls overlay - bottom */}
//                             <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
//                                 <div className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
//                                     ResumeForge Demo
//                                 </div>
//                                 <button
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         toggleFullScreen();
//                                     }}
//                                     className="text-white bg-black/20 p-2 rounded-full border border-white/10 transition-all duration-300 hover:bg-black/30"
//                                     aria-label="Toggle fullscreen"
//                                 >
//                                     <Maximize2 className="w-4 h-4" />
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Feature badges below video */}
//                     <div className="flex flex-wrap justify-center gap-3 mt-6">
//                         <span className="px-3 py-1 rounded-full bg-indigo-50 text-sm border border-indigo-200 text-indigo-700">
//                             Interactive Demo
//                         </span>
//                         <span className="px-3 py-1 rounded-full bg-indigo-50 text-sm border border-indigo-200 text-indigo-700">
//                             User-friendly Interface
//                         </span>
//                         <span className="px-3 py-1 rounded-full bg-indigo-50 text-sm border border-indigo-200 text-indigo-700">
//                             Real-Time AI Assistance
//                         </span>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// }

"use client";

import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ResumeAnalyzerComparison() {
  return (
    <section className="py-20 px-4 relative overflow-hidden" id="comparison">

      {/* Background glow */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-red-100/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-green-100/20 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Old Resume Tools vs ResumeForge AI
          </h2>
          <p className="text-muted-foreground mt-3">
            See the difference between basic analyzers and AI-powered optimization
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* OLD SYSTEM */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="p-6 rounded-2xl border border-red-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <h3 className="text-lg font-semibold text-red-600 mb-5">
              ❌ Traditional Resume Analyzer
            </h3>

            <motion.ul className="space-y-3 text-sm text-gray-600">
              {[
                "Generic feedback like “Improve your resume structure”",
                "No ATS keyword optimization suggestions",
                "Static scoring without real improvements",
                "No role-based customization",
                "No actual rewritten content",
              ].map((text, i) => (
                <motion.li
                  key={i}
                  variants={item}
                  className="
                    p-3 rounded-lg bg-red-50 border border-red-100
                    transition-all duration-300
                    hover:bg-red-100 hover:shadow-md hover:scale-[1.02] cursor-default
                  "
                >
                  {text}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* NEW SYSTEM */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="p-6 rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-green-400"
          >
            <h3 className="text-lg font-semibold text-green-600 mb-5">
              🚀 ResumeForge AI Analyzer
            </h3>

            <motion.ul className="space-y-3 text-sm text-gray-700">
              {[
                "AI rewrites bullet points with impact + metrics",
                "ATS keyword optimization based on job role",
                "Real-time resume improvement suggestions",
                "Role-specific tailoring (FAANG / startups / internships)",
                "Auto-generates optimized resume sections tailored for target roles",
              ].map((text, i) => (
                <motion.li
                  key={i}
                  variants={item}
                  className="
                    p-3 rounded-lg bg-white border border-green-100
                    flex gap-2
                    transition-all duration-300
                    hover:bg-green-50 hover:shadow-md hover:scale-[1.02]
                    cursor-default
                  "
                >
                  <span className="text-green-600 font-bold">✔</span>
                  {text}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground">
            ResumeForge doesn’t just analyze — it actively improves your resume using AI.
          </p>
        </motion.div>

      </div>
    </section>
  );
}