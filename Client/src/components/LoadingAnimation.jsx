import React from 'react';
import { motion } from 'framer-motion';

const LoadingAnimation = () => {
  const name = "FAYAS ISMAEL";
  const letters = Array.from(name);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.98)',
        zIndex: 9999,
      }}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={container}
    >
      <motion.div
        style={{
          display: 'flex',
          overflow: 'hidden',
          fontSize: '2rem',
          fontWeight: 600,
          letterSpacing: '0.3em',
        }}
      >
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            style={{
              display: 'inline-block',
              marginRight: letter === " " ? "0.3em" : "0",
              color: '#333',
            }}
            variants={child}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default LoadingAnimation; 