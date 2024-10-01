import { analyticsTrack } from "@/analytics/analytics";

const KakaoShareCallBack: React.FC = () => {
  analyticsTrack("콜백_카카오_전송완료", { where: "KakaoShareCallBack" });
  return null;
};

export default KakaoShareCallBack;
