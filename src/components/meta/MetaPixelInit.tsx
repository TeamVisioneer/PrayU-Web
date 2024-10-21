// import React, { useEffect } from "react";

// const MetaPixelInit: React.FC = () => {
//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = "./metaPixelScript.js";
//     document.head.appendChild(script);
//     return () => {
//       document.head.removeChild(script);
//     };
//   }, []);

//   return null;
// };
// export default MetaPixelInit;

import React from "react";
import { Helmet } from "react-helmet";

const MetaPixelInit: React.FC = () => {
  return (
    <Helmet>
      {/* Meta Pixel Script */}
      <script>
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '3851311148517680');
          fbq('track', 'PageView');
        `}
      </script>

      {/* NoScript Tag */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=3851311148517680&ev=PageView&noscript=1"
        />
      </noscript>
    </Helmet>
  );
};

export default MetaPixelInit;
