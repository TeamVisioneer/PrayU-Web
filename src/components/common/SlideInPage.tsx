import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SlideInPageProps {
  children: ReactNode;
}

const SlideInPage = ({ children }: SlideInPageProps) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: "100%",
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        type: "tween",
        ease: "anticipate",
        duration: 0.3,
      }}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {children}
    </motion.div>
  );
};

export default SlideInPage;
