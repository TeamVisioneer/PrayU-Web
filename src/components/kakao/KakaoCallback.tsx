import { getDomainUrl } from "@/lib/utils";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "../ui/button";

const KakaoCallBack = () => {
  const location = useLocation();
  const baseUrl = getDomainUrl();

  const getMyProfiles = () => {
    window.Kakao.API.request({
      url: "/v1/api/talk/profile",
    })
      .then(function (response) {
        alert("success: " + JSON.stringify(response));
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const selectUsers = () => {
    window.Kakao.Picker.selectFriends({
      title: "친구 선택",
      maxPickableCount: 10,
      minPickableCount: 1,
    })
      .then(function (response) {
        alert("success: " + JSON.stringify(response));
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const fetchFriends = () => {
    window.Kakao.API.request({
      url: "/v1/api/talk/friends",
    })
      .then(function (response) {
        alert("success: " + JSON.stringify(response));
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const sendMessage = () => {
    window.Kakao.API.request({
      url: "/v2/api/talk/memo/scrap/send",
      data: {
        request_url: baseUrl,
      },
    })
      .then(function (response) {
        alert("success: " + JSON.stringify(response));
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (code) {
      const fetchToken = async () => {
        try {
          const response = await fetch("https://kauth.kakao.com/oauth/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              client_id: import.meta.env.VITE_KAKAO_REST_API_KEY,
              client_secret: import.meta.env.VITE_KAKAO_CLIENT_SECRET_KEY,
              redirect_uri: `${baseUrl}/auth/kakao/callback`,
              code: code,
            }).toString(),
          });

          const data = await response.json();
          console.log(data);
          // 리프레시 토큰을 통한 관리 필요, 쿠키를 통한 관리 필요
          window.Kakao.Auth.setAccessToken(data.access_token);
        } catch (error) {
          console.error("토큰 요청 실패:", error);
        }
      };

      fetchToken();
    }
  }, [location.search, baseUrl]);

  return (
    <div>
      <div className="flex flex-col gap-2">
        <h2>OAuth Callback</h2>

        <Button onClick={() => fetchFriends()}>fetchFriends</Button>
        <Button onClick={() => selectUsers()}>selectUsers</Button>
        <Button onClick={() => getMyProfiles()}>getMyProfiles</Button>
        <Button onClick={() => sendMessage()}>sendMessage</Button>
        <a className="text-gray-500 underline" href={`${baseUrl}`}>
          홈으로
        </a>
      </div>
    </div>
  );
};

export default KakaoCallBack;
