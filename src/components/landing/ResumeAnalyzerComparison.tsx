"use client";

import { useRef } from "react";
import { useGsapReveal } from "@/hooks/useGsapReveal";

export function ResumeAnalyzerComparison() {
  const sectionRef = useRef(null);
  useGsapReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 relative overflow-hidden"
      id="comparison"
    >

      {/* Background */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-red-100/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-green-100/20 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Old Resume Tools vs ResumeForge AI
          </h2>
          <p className="text-muted-foreground mt-3">
            See how AI transforms resume building
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* OLD */}
          <div className="
            p-6 rounded-2xl border border-red-200 bg-white shadow-sm
            transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
          ">
            <h3 className="text-lg font-semibold text-red-600 mb-5">
              ❌ Traditional Resume Analyzer
            </h3>

            {[
              "Generic feedback only",
              "No ATS optimization",
              "Static scoring",
              "No personalization",
              "No rewritten content",
            ].map((t, i) => (
              <div
                key={i}
                className="
                  p-3 mb-3 rounded-lg bg-red-50 border border-red-100
                  hover:bg-red-100 transition flex gap-2 items-start
                "
              >
                <span className="text-red-500 font-bold">❌</span>
    <span>{t}</span>
              </div>
            ))}
          </div>

          {/* NEW */}
          <div className="
            p-6 rounded-2xl border border-green-200
            bg-gradient-to-br from-green-50 to-white
            shadow-md
            transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
          ">
            <h3 className="text-lg font-semibold text-green-600 mb-5">
              🚀 ResumeForge AI Analyzer
            </h3>

            {[
              "AI-powered rewriting",
              "ATS optimization",
              "Real-time improvements",
              "Role-based tailoring (internship, startups)",
              "Instant resume generation",
            ].map((t, i) => (
              <div
                key={i}
                className="
                  p-3 mb-3 rounded-lg bg-white border border-green-100
                  hover:scale-[1.02] hover:bg-green-50 transition
                "
              >
                ✔ {t}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}