import { motion } from 'framer-motion';

export default function MeshGradient() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#020617] pointer-events-none">
      {/* Base Layer */}
      <div className="absolute inset-0 bg-[#020617]" />
      
      {/* Animated Glowing Orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0, -100, 0],
          y: [0, -50, 50, -50, 0],
          scale: [1, 1.2, 1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] left-[30%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen"
      />
      
      <motion.div
        animate={{
          x: [0, -100, 0, 100, 0],
          y: [0, 50, -50, 50, 0],
          scale: [1, 1.1, 1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 1 }}
        className="absolute bottom-[10%] right-[20%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] mix-blend-screen"
      />

      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, 100, 0, -100, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
        className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] mix-blend-screen"
      />

      {/* Grid Pattern Overlay for Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }}
      />
    </div>
  );
}
