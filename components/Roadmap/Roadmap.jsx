import { motion } from "framer-motion";
import { useState } from "react";

const RoadmapCard = ({ phase, title, description, isActive, onClick }) => {
  return (
    <motion.div
      className={`relative cursor-pointer rounded-lg border border-[#ffffff20] bg-black/50 backdrop-blur-sm p-6 transition-all duration-300 ${
        isActive ? 'z-10 scale-105' : 'z-0'
      }`}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      onClick={onClick}
      style={{
        boxShadow: isActive ? '0 0 20px rgba(0, 255, 255, 0.3)' : 'none',
      }}
    >
      <div className="mb-3">
        <span className="text-cyan-400 font-inter font-medium">{phase}</span>
      </div>
      <h3 className="text-xl font-inter font-medium mb-2 text-white">{title}</h3>
      <p className="text-sm text-[#cccccc] font-inter">{description}</p>
    </motion.div>
  );
};

const Roadmap = () => {
  const [activePhase, setActivePhase] = useState(null);

  const roadmapData = [
    {
      phase: "Phase 1",
      title: "Foundation Models",
      description: "Launching with powerful base models including GPT-4, Claude 3.5, and LLaMA 3.3. Establishing core infrastructure for model deployment and API integration.",
      status: "Completed",
      items: [
        "GPT-4 Integration",
        "Claude 3.5 Support",
        "LLaMA 3.3 Implementation",
        "Base API Infrastructure"
      ]
    },
    {
      phase: "Phase 2",
      title: "Advanced Features",
      description: "Expanding capabilities with multimodal models, enhanced context handling, and specialized AI models for specific tasks.",
      status: "In Progress",
      items: [
        "Image Generation Models",
        "Code Completion Models",
        "Voice Recognition AI",
        "Context Length Expansion"
      ]
    },
    {
      phase: "Phase 3",
      title: "Specialized Solutions",
      description: "Introducing domain-specific models and advanced features for enterprise applications and specialized use cases.",
      status: "Upcoming",
      items: [
        "Medical AI Models",
        "Financial Analysis AI",
        "Legal Document Processing",
        "Research Assistant Models"
      ]
    },
    {
      phase: "Phase 4",
      title: "Next Generation",
      description: "Pushing boundaries with cutting-edge AI technologies and revolutionary model architectures for unprecedented capabilities.",
      status: "Future",
      items: [
        "Quantum AI Models",
        "AGI Research Integration",
        "Custom Model Training",
        "Cross-Model Synthesis"
      ]
    }
  ];

  return (
    <div className="relative w-full py-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/roadmap-bg.png" // Make sure to add your image to the public folder
          alt="Roadmap Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <h2 className="text-center font-inter font-medium text-[#ffffff] sm:text-5xl xs:text-4xl xss:text-[9vw] leading-10 mb-4">
          Roadmap to Revolution
        </h2>
        <h4 className="text-center font-inter font-medium text-[#cccccc] sm:text-base xss:text-sm sm:w-[60%] mt-3 xss:w-[95%] mx-auto mb-16">
          Our strategic path to transforming the Web3 analytics landscape
        </h4>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmapData.map((item, index) => (
            <RoadmapCard
              key={index}
              {...item}
              isActive={activePhase === index}
              onClick={() => setActivePhase(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Roadmap; 