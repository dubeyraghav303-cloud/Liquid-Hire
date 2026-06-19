"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-slate-50/50 backdrop-blur-sm">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="h-12 w-12 rounded-full border-4 border-indigo-100 border-t-indigo-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading...</p>
      </motion.div>
    </div>
  );
}
