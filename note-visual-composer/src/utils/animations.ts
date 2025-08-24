import { Variants } from 'framer-motion';

export const nodeVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)'
  },
  playing: {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 10px rgba(59, 130, 246, 0.2)',
      '0 0 30px rgba(59, 130, 246, 0.6)',
      '0 0 10px rgba(59, 130, 246, 0.2)'
    ]
  },
  pressed: {
    scale: 0.95
  }
};

export const glowVariants: Variants = {
  idle: {
    opacity: 0.3,
    scale: 1
  },
  playing: {
    opacity: [0.3, 0.7, 0.3],
    scale: [1, 1.2, 1]
  }
};

export const connectionVariants: Variants = {
  hidden: {
    scaleX: 0,
    opacity: 0
  },
  visible: {
    scaleX: 1,
    opacity: 0.4,
    transition: {
      scaleX: { duration: 0.5, ease: "easeOut" },
      opacity: { duration: 0.3 }
    }
  },
  active: {
    scaleX: 1,
    opacity: 0.8,
    transition: {
      opacity: { duration: 0.2 }
    }
  }
};

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2
    }
  }
};

export const controlsVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      staggerChildren: 0.05
    }
  }
};

export const springConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30
};

export const smoothConfig = {
  type: "tween" as const,
  duration: 0.3,
  ease: "easeInOut" as const
};

export const organicConfig = {
  type: "spring" as const,
  stiffness: 200,
  damping: 20,
  mass: 1
};