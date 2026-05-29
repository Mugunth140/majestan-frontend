'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-[#f8f9ff] to-[#eef0ff] flex items-center justify-center px-4 py-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full text-center"
      >
        {/* 404 Number */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-[120px] md:text-[180px] font-black text-[#27427f]/20 leading-none">
            404
          </h1>
        </motion.div>

        {/* Icon */}
        <motion.div variants={itemVariants} className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#27427f] to-[#ffc900] rounded-full blur-2xl opacity-20 animate-pulse" />
            <div className="relative bg-white rounded-full p-8 shadow-lg">
              <Search size={64} className="text-[#27427f]" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black text-[#27427f] mb-4">
          Page Not Found
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-[#27427f]/70 mb-8 leading-relaxed"
        >
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist anymore.
        </motion.p>

        {/* Suggestions */}
        <motion.div variants={itemVariants} className="mb-10 p-6 bg-white rounded-2xl border border-[#27427f]/10 shadow-sm">
          <p className="text-sm text-[#27427f]/60 mb-4">Did you mean to:</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#27427f] text-white font-semibold hover:bg-[#27427f]/90 transition-colors"
            >
              <Home size={18} />
              Go Home
            </Link>
            <Link
              href="/buy-apartments-coimbatore"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-[#27427f] text-[#27427f] font-semibold hover:bg-[#27427f]/5 transition-colors"
            >
              <Search size={18} />
              Browse Properties
            </Link>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div variants={itemVariants} className="space-y-4 text-sm text-[#27427f]/60">
          <p>
            If you believe this is a mistake, please{' '}
            <Link href="/contact-us" className="text-[#ffc900] font-semibold hover:text-[#ffc900]/80">
              contact us
            </Link>
          </p>
          <p className="flex items-center justify-center gap-2">
            <ArrowLeft size={16} />
            <Link href="/" className="text-[#27427f] font-semibold hover:text-[#27427f]/80">
              Return to previous page
            </Link>
          </p>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mt-12 flex justify-center gap-4"
        >
          <div className="w-2 h-2 rounded-full bg-[#27427f]/20" />
          <div className="w-2 h-2 rounded-full bg-[#ffc900]" />
          <div className="w-2 h-2 rounded-full bg-[#27427f]/20" />
        </motion.div>
      </motion.div>
    </main>
  );
}
