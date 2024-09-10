import { useLocation } from "react-router-dom";

const TermServicePage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectUrl = queryParams.get("redirectUrl");

  console.log("redirectUrl", redirectUrl);

  return <div>TermServicePage</div>;
};

export default TermServicePage;
