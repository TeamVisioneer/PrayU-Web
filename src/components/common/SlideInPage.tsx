import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

interface SlideInPageProps {
  children: ReactNode;
}

const SlideInPage = ({ children }: SlideInPageProps) => {
  // 경로를 key 로 — 인접 라우트가 모두 SlideInPage 로 감싸이면 React 가 같은 타입
  // 트리로 보고 인스턴스를 재사용해, 라우트가 바뀌어도 마운트 애니메이션이 재생되지
  // 않는다 (/group 래핑 후 드러난 회귀). key 가 바뀌면 강제 리마운트되어 매 진입마다 슬라이드한다.
  const { pathname } = useLocation();
  return (
    <motion.div
      key={pathname}
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
