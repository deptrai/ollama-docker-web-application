import { type MotionProps, type Variants, type Target, type EasingDefinition, type AnimationProps } from 'framer-motion';

interface AnimationConfig {
    duration?: number;
    delay?: number;
    ease?: EasingDefinition;
    staggerChildren?: number;
}

interface AnimationConfig {
    // Position and movement
    initialX?: string;
    targetX?: string;
    initialY?: string;
    targetY?: string;
    initialRotate?: number;
    targetRotate?: number;

    // Scaling
    initialScale?: number;
    targetScale?: number;
    tapScale?: number;
    hoverScale?: number;

    // Timing
    repeatDelay?: number;
    duration?: number;
    delay?: number;
    staggerChildren?: number;

    // Physics configs
    springConfig?: {
        stiffness: number;
        damping: number;
        mass: number;
        velocity?: number;
        restSpeed?: number;
    };
    scaleConfig?: {
        stiffness: number;
        damping: number;
        mass: number;
        velocity?: number;
        restSpeed?: number;
    };
    rotateConfig?: {
        stiffness: number;
        damping: number;
        mass: number;
    };

    // Effects
    ease?: EasingDefinition;
    direction?: "up" | "down" | "left" | "right";
    distance?: number;
    opacity?: number;
    blur?: string;
    skew?: number;
}

/**
 * Creates animation configuration for various animation effects
 * @param config - Configuration options for the animation
 * @returns MotionProps object for Framer Motion
 */
export const createAnimation = ({
    // Position defaults
    initialX = "100%",
    targetX = "-100%",
    initialY = "0%",
    targetY = "0%",
    initialRotate = 0,
    targetRotate = 0,

    // Scale defaults  
    initialScale = 0.8,
    targetScale = 1,
    tapScale = 0.95,
    hoverScale = 1.05,

    // Timing defaults
    repeatDelay = 1,
    duration = 0.3,

    // Config defaults
    springConfig = {
        stiffness: 20,
        damping: 15,
        mass: 2
    },
    scaleConfig = {
        stiffness: 200,
        damping: 5,
        mass: 0.5
    },
    rotateConfig = {
        stiffness: 100,
        damping: 10,
        mass: 1
    },

    // Effect defaults
    opacity = 1,
    blur = "0px",
    skew = 0

}: AnimationConfig = {}): MotionProps => ({
    initial: {
        "--x": initialX,
        "--y": initialY,
        scale: initialScale,
        rotate: initialRotate,
        opacity: 0.6,
        filter: `blur(${blur})`,
        skewX: skew
    } as Target,
    animate: {
        "--x": targetX,
        "--y": targetY, 
        scale: targetScale,
        rotate: targetRotate,
        opacity,
        filter: "blur(0px)",
        skewX: 0
    } as Target,
    whileHover: {
        scale: hoverScale,
        transition: {
            type: "spring",
            ...scaleConfig
        }
    } as Target,
    whileTap: {
        scale: tapScale
    } as Target,
    transition: {
        repeat: Infinity,
        repeatType: "loop" as const,
        repeatDelay,
        duration,
        type: "spring",
        ...springConfig,
        scale: {
            type: "spring",
            ...scaleConfig
        },
        rotate: {
            type: "spring", 
            ...rotateConfig
        }
    }
});

// Enhanced fade animations with multiple variants
export const fadeAnimations: Record<string, Variants> = {
    default: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.2 } }
    },
    slow: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.6 } },
        exit: { opacity: 0, transition: { duration: 0.4 } }
    },
    withScale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
    }
};

// Comprehensive slide animations
export const createSlideAnimation = ({
    duration = 0.4,
    delay = 0,
    ease = "easeOut",
    direction = "up",
    distance = 20
}: AnimationConfig & {
    direction?: "up" | "down" | "left" | "right";
    distance?: number;
}): Variants => {
    const getTransform = (dist: number): Target => ({
        x: direction === "left" ? dist : direction === "right" ? -dist : 0,
        y: direction === "up" ? dist : direction === "down" ? -dist : 0
    });

    return {
        initial: { ...getTransform(distance), opacity: 0 },
        animate: { 
            ...getTransform(0), 
            opacity: 1,
            transition: { duration, delay, ease }
        },
        exit: {
            ...getTransform(-distance),
            opacity: 0,
            transition: { duration: duration * 0.75 }
        }
    };
};

// Advanced scale animations
export const scaleAnimations: Record<string, Variants> = {
    popIn: {
        initial: { scale: 0, opacity: 0 },
        animate: { 
            scale: 1, 
            opacity: 1,
            transition: { type: "spring", stiffness: 400, damping: 17 }
        },
        exit: { scale: 0, opacity: 0 }
    },
    smooth: {
        initial: { scale: 0.95, opacity: 0 },
        animate: { 
            scale: 1, 
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" }
        },
        exit: { scale: 0.95, opacity: 0 }
    },
    bounce: {
        initial: { scale: 0.3, opacity: 0 },
        animate: { 
            scale: 1, 
            opacity: 1,
            transition: { 
                type: "spring",
                stiffness: 300,
                damping: 10,
                mass: 0.5
            }
        },
        exit: { scale: 0.3, opacity: 0 }
    }
};

// Rotate animations
export const rotateAnimations: Record<string, Variants> = {
    spin: {
        initial: { rotate: -180, opacity: 0 },
        animate: { 
            rotate: 0, 
            opacity: 1,
            transition: { type: "spring", damping: 15 }
        },
        exit: { rotate: 180, opacity: 0 }
    },
    flip: {
        initial: { rotateX: -90, opacity: 0 },
        animate: { 
            rotateX: 0, 
            opacity: 1,
            transition: { duration: 0.4, ease: "easeOut" }
        },
        exit: { rotateX: 90, opacity: 0 }
    }
};

// Stagger animations for lists/groups
export const createStaggerAnimation = ({
    duration = 0.3,
    staggerChildren = 0.1,
    ease = "easeOut"
}: AnimationConfig): Variants => ({
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            staggerChildren,
            delayChildren: 0.1,
            ease,
            duration
        }
    },
    exit: { opacity: 0 }
});

// Child variants for stagger animations
export const staggerItemVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
        y: 0, 
        opacity: 1,
        transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { y: 20, opacity: 0 }
};

// Performance optimized transition presets
export const transitions = {
    performant: {
        type: "tween",
        ease: "easeOut",
        duration: 0.3,
        willChange: "transform, opacity"
    } as const,
    spring: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 1,
        restDelta: 0.001
    } as const,
    bounce: {
        type: "spring",
        stiffness: 300,
        damping: 10,
        mass: 0.5,
        restDelta: 0.001
    } as const
};

// Attention-grabbing animations
export const attentionAnimations: Record<string, Variants> = {
    pulse: {
        initial: { scale: 1 },
        animate: { 
            scale: [1, 1.05, 1],
            transition: { 
                duration: 0.4,
                times: [0, 0.5, 1],
                repeat: Infinity,
                repeatType: "reverse"
            }
        }
    },
    shake: {
        initial: { x: 0 },
        animate: {
            x: [-2, 2, -2, 2, 0],
            transition: { 
                duration: 0.4,
                times: [0, 0.25, 0.5, 0.75, 1],
                repeat: Infinity,
                repeatType: "reverse"
            }
        }
    }
};

// Blur animations
export const blurAnimations: Record<string, Variants> = {
    default: {
        initial: { filter: 'blur(8px)', opacity: 0 },
        animate: { 
            filter: 'blur(0px)',
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: 'easeOut'
            }
        },
        exit: {
            filter: 'blur(8px)',
            opacity: 0,
            transition: {
                duration: 0.3,
                ease: 'easeIn'  
            }
        }
    },
    heavy: {
        initial: { filter: 'blur(20px)', opacity: 0 },
        animate: {
            filter: 'blur(0px)', 
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: 'easeOut'
            }
        },
        exit: {
            filter: 'blur(20px)',
            opacity: 0,
            transition: {
                duration: 0.4,
                ease: 'easeIn'
            }
        }
    }
};


// HOC with performance optimizations
export const withMotion = <P extends object>(
    props: P & MotionProps & {
        layoutId?: string;
        whileHover?: MotionProps["whileHover"];
        whileTap?: MotionProps["whileTap"];
    }
): P & MotionProps => ({
    ...props,
    initial: "initial",
    animate: "animate",
    exit: "exit",
    layoutRoot: true,
    layout: props.layoutId ? true : undefined,
});


