import React, { useEffect } from "react";

const MetaPixelInit: React.FC = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "./metaPixelScript.js";
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
};
export default MetaPixelInit;
