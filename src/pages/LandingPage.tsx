import React from "react";

const LandingPage = () => {
  return (
    <div className="flex flex-grow flex-col justify-center text-center w-full bg-white   ">
      <img
        src="https://upload.cafenono.com/image/slashpageCoverImage/20240916/185050_YMqbXIJWrIVwvZeh02?q=90&s=1280x1&t=outside&f=webp"
        className="w-full h-auto  " // w-full 대신 w-screen을 사용해 화면 전체 너비로 조정
        alt="ddd"
      />
      <div className="font-sans bg-gray-100 text-center">
        <div className="container max-w-screen-lg mx-auto px-4 py-10">
          <h1 className="text-2xl text-gray-700 mt-6">카톡방 속 답장 없는</h1>
          <h1 className="text-2xl text-gray-700">기도제목 나눔은 이제 그만!</h1>
          <h2 className="text-xl text-gray-500 mt-5">이제는 그룹원들과</h2>
          <h2 className="text-xl text-gray-500 ">
            지속적으로 소통하며 기도해요
          </h2>
          <div className="h-20"></div>

          <a
            className="inline-block mt-6 px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            href="https://prayu.vercel.app/?utm_source=slashpage&utm_medium=topBtn&utm_campaign=241001"
          >
            PrayU 지금 시작
          </a>
          <div className="h-8"></div>
          <h3 className="text-gray-600 mt-6">.</h3>
          <h3 className="text-gray-600 mt-3">.</h3>
          <h3 className="text-gray-600 mt-3">.</h3>
          <div className="h-8"></div>

          <div className="image-container mt-10">
            <img
              src="https://upload.cafenono.com/image/slashpageHome/20240621/140339_Lp0sfmrmhn1jJK0J9V?q=75&s=1280x180&t=outside&f=webp"
              alt="Group Image"
              className="mx-auto"
            />
          </div>

          <p className="text-gray-600 mt-6">
            오늘도 힘쓰고 계실 그룹장 및 리더 여러분
          </p>
          <p className="text-gray-600 mt-2">
            다들 이런 고민 한 번쯤은 해보시지 않았나요?
          </p>

          <div className="h-20"></div>

          <blockquote className="mt-4 text-gray-500 italic">
            <p>" 그룹원들의 기도 활성화를 위해서는"</p>
            <p>" 무엇부터 해야하지.. "</p>
            <div className="h-10"></div>
            <p>" 우리 그룹원들도"</p>
            <p>" 주기적으로 기도제목을 올렸으면 좋겠다.. "</p>
            <div className="h-10"></div>
            <p>" 그룹원들과 지속적으로 기도 하고 싶다... "</p>
          </blockquote>

          <div className="h-8"></div>
          <h3 className="text-gray-600 mt-6">.</h3>
          <h3 className="text-gray-600 mt-3">.</h3>
          <h3 className="text-gray-600 mt-3">.</h3>
          <div className="h-8"></div>

          <p className="text-gray-600 mt-2">
            사실 이 고민 모두 제 이야기입니다...😂
          </p>

          <div className="image-container mt-8">
            <img
              src="https://upload.cafenono.com/image/slashpageHome/20240621/141105_TPaqZt9U34uMoIOS3e?q=75&s=1280x180&t=outside&f=webp"
              alt="Prayer Image"
              className="mx-auto"
            />
          </div>

          <div className="h-20"></div>

          <p className="text-gray-600 mt-2">기도 제목을 나눠도 반응은 없고,</p>
          <p className="text-gray-600 mt-2">
            함께 기도하고 싶은 마음만 앞섰던 것 같네요
          </p>

          <div className="h-8"></div>
          <h3 className="text-gray-600 mt-6">.</h3>
          <h3 className="text-gray-600 mt-3">.</h3>
          <h3 className="text-gray-600 mt-3">.</h3>
          <div className="h-8"></div>

          <h2 className="text-2xl font-semibold text-gray-700 mt-10">
            문제를 차근차근 다시 보았어요 🔍
          </h2>

          <div className="image-container mt-8">
            <img
              src="https://upload.cafenono.com/image/slashpageHome/20240613/182804_cVpQpl2TZoFtOC8LIO?q=75&s=1280x180&t=outside&f=webp"
              alt="Problem Analysis"
              className="mx-auto"
            />
          </div>

          <p className="text-gray-600 mt-6">근본적으로는 카톡 채팅방 내에서</p>
          <p className="text-gray-600">지속적인 나눔에 한계가 보였습니다.</p>
          <p className="text-gray-600">카톡방에서의 활성화 방안들이</p>
          <p className="text-gray-600">
            실제로 효과가 많이 있을지 고민되었어요.
          </p>

          <div className="h-32   "></div>

          <div className="image-container mt-8">
            <img
              src="https://upload.cafenono.com/image/slashpageHome/20240613/182741_SUzyHqwUSFe4XiBRon?q=75&s=1280x180&t=outside&f=webp"
              alt="Problem Analysis2"
              className="mx-auto"
            />
          </div>

          <p className="text-gray-600 mt-6">기도제목을 나누더라도</p>
          <p className="text-gray-600">
            한 주 동안 지속적으로 노출되기 어려웠고
          </p>

          <div className="h-32"></div>

          <div className="image-container mt-8">
            <img
              src="https://upload.cafenono.com/image/slashpageHome/20240613/172549_K04oZXNB40ce6vzB0Q?q=75&s=1280x180&t=outside&f=webp"
              alt="Problem Analysis3"
              className="mx-auto"
            />
          </div>

          <p className="text-gray-600 mt-6">기도제목에 대한 반응 또한</p>
          <p className="text-gray-600">
            이모티콘으로 충분하지 않다는 생각이 들었습니다.
          </p>

          <div className="h-32"></div>

          <p className="text-gray-600 mt-6">최종적으로</p>
          <p className="text-gray-600">
            함께 기도하고자 하는 사람들을 위해서는
          </p>
          <p className="text-gray-600">다른 형태의 기도제목 공유가</p>
          <p className="text-gray-600">이루어져야 한다고 생각했어요.</p>

          <div className="h-8"></div>
          <h3 className="text-gray-600 mt-6">.</h3>
          <h3 className="text-gray-600 mt-3">.</h3>
          <h3 className="text-gray-600 mt-3">.</h3>
          <div className="h-8"></div>

          <div className="section mt-10">
            <h1 className="text-2xl font-semibold text-gray-700">그.래.서</h1>
            <h3 className=" font-semibold mt-6">결심했습니다</h3>
            <div className="image-container mt-8">
              <img
                src="https://upload.cafenono.com/image/slashpageHome/20240621/140440_F05XjS6sm0Hf0Jtmgq?q=75&s=1280x180&t=outside&f=webp"
                alt="Decision Image"
                className="mx-auto"
              />
            </div>

            <p className="text-gray-600 mt-7 ">
              기도제목의 공유를 위한 프로그램을
            </p>
            <p className="text-gray-600 mt-2">제가 직접 만들어보기로 ⭐</p>
            <p className="text-gray-600 mt-7 ">본업이 개발자이기도 하고</p>
            <p className="text-gray-600 mt-2">교회의 나눔 문화에 익숙한 만큼</p>
            <p className="text-gray-600 mt-7 ">이런 문제점을 잘 반영하여</p>
            <p className="text-gray-600 mt-2">
              좋은 해결책을 만들 수 있겠다고 생각했어요
            </p>

            <div className="h-32 "></div>

            <a
              className="inline-block mt-6 px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              href="https://prayu.vercel.app/?utm_source=slashpage&utm_medium=middleBtn&utm_campaign=241001"
            >
              PrayU 지금 시작
            </a>
          </div>

          <div className="section mt-10">
            <h2 className="text-2xl font-semibold text-gray-700">
              이렇게 해결했어요 😊
            </h2>
            <div className="image-container mt-8">
              <img
                src="https://upload.cafenono.com/image/slashpageHome/20240916/182909_BRBek8IC3pfeJhBPMs?q=80&s=1280x180&t=outside&f=webp"
                alt="Solution Image"
                className="mx-auto"
              />
            </div>
            <p className="text-gray-600 mt-6">
              우리 소그룹 내에서 먼저 사용해보고자 그룹기반 기도제목 나눔
              서비스를 카카오톡 버전으로 만들어 보았어요
            </p>
          </div>

          <div className="section mt-10">
            <div className="image-container mt-8">
              <img
                src="https://upload.cafenono.com/image/slashpageHome/20240916/183039_Ufmrd2Tpbo1pKKWjX0?q=80&s=1280x180&t=outside&f=webp"
                alt="Solution Image2"
                className="mx-auto"
              />
            </div>
            <p className="text-gray-600 mt-6">
              그룹원들이 기도제목을 작성하면 일주일동안 기도제목을 넘기면서
              매일매일 서로를 위해 기도해줄 수 있어요!
            </p>
          </div>

          <div className="section mt-10">
            <div className="image-container mt-8">
              <img
                src="https://upload.cafenono.com/image/slashpageHome/20240916/183138_GfKH43wKr05myxOxAN?q=80&s=1280x180&t=outside&f=webp"
                alt="Solution Image3"
                className="mx-auto"
              />
            </div>
            <p className="text-gray-600 mt-6">
              카카오톡 버전 답게 카카오톡 친화적으로 기능을 만들었어요! 그룹
              링크를 공지에 두고 채팅방에서 접근하며 매일매일 말씀카드를 공유할
              수 있도록 하였어요:)
            </p>
          </div>

          <p className="text-gray-600 mt-6">
            그리고 제 소그룹과 주변 다른 리더들에게 먼저 사용해보도록 도움을
            요청했습니다!
          </p>

          <div className="h-8"></div>
          <h3 className="text-gray-600 mt-6">.</h3>
          <h3 className="text-gray-600 mt-3">.</h3>
          <h3 className="text-gray-600 mt-3">.</h3>
          <div className="h-8"></div>

          <div className="section mt-10">
            <h2 className="text-2xl font-semibold text-gray-700">
              정말로 효과가 있었어요 😊
            </h2>
            <div className="flex flex-row">
              <div className="flex flex-col">
                <div className="image-container mt-8">
                  <img
                    src="https://upload.cafenono.com/image/slashpageHome/20240621/154539_dA0JVrnt1lcWQAkCX3?q=90&s=1280x1&t=outside&f=webp"
                    alt="Reference Image"
                    className="mx-auto"
                  />
                </div>
                <p className="text-gray-600 mt-6">우리 소그룹원의 감사 인사❤</p>
              </div>
              <div className="w-11 "> </div>
              <div className="flex flex-col">
                <div className="image-container mt-8">
                  <img
                    src="https://upload.cafenono.com/image/slashpageHome/20240621/154552_ndJH8KhwBRrBmCRugy?q=90&s=1280x1&t=outside&f=webp"
                    alt="Solution Image2"
                    className="mx-auto"
                  />
                </div>
                <p className="text-gray-600 mt-6">
                  일주일 사용해본 그룹장의 평가💛
                </p>
              </div>
              <div className="w-11 "> </div>
              <div className="flex flex-col">
                <div className="image-container mt-8">
                  <img
                    src="https://upload.cafenono.com/image/slashpageHome/20240621/154603_qi56DVLLqrK8kXptiZ?q=90&s=1280x1&t=outside&f=webp"
                    alt="Solution Image3"
                    className="mx-auto"
                  />
                </div>
                <p className="text-gray-600 mt-6">
                  소문을 듣고 쓰고 싶다고 한 그룹장💙
                </p>
              </div>
            </div>
          </div>
          <div className="h-32"></div>

          <p className="text-gray-600 mt-6">
            실제로 여러 번 기도해주는 환경을 접해보니 기도가 즐겁고 구성원
            서로가 더 고마워진다는 반응이 가장
          </p>
          <p className="text-gray-600 mt-6">
            우리 내부에서만 쓰기에 아깝다고 느껴서 같은 활성화 문제를 겪는
            분들께도 도움을 주고 싶다는 생각이 들었습니다.
          </p>

          <h3 className="text-red-600 mt-11 ">.</h3>

          <h2 className="text-2xl font-semibold text-gray-700 mt-10">
            이런 목표를 갖고 있어요 😊
          </h2>
          <div className="image-container mt-8">
            <img
              src="https://upload.cafenono.com/image/slashpageHome/20240913/145610_gVpZYwWKqOAdxwNm0U?q=90&s=1920x1&t=outside&f=webp"
              alt="Goal Image"
              className="mx-auto"
            />
          </div>
          <div className="h-11 "></div>
          <p className="text-gray-600 mt-6">
            매주 주일 기도제목을 나누고 끝나는 그룹에서 매일 서로를 위해
            기도하며 나누는 그룹을 목표로 나아가고 있습니다.
          </p>
          <div className="h-32 "></div>
          <h2 className="text-2xl font-semibold text-gray-700 mt-10">
            이름은 PrayU 로 정했어요⭐
          </h2>
          <p className="text-gray-600 mt-14">
            현재 그룹기반 기도제목 공유앱 PrayU 를 새롭게 만들어가고 있습니다.
          </p>

          <p className="text-gray-600 mt-14 ">
            여러분들의 도움이 필요합니다. 교회의 나눔 활성화를 위해 노력하는
            분들의 많은 관심과 사랑이 PrayU 를 만들어가고 있습니다.
          </p>

          <p className="text-gray-600 mt-14">
            모두를 위한 기도제목 공유앱 PrayU 을 위해 함께 동참해 주시길
            소망합니다 🙏
          </p>

          <a
            className="inline-block mt-6 px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            href="https://prayu.vercel.app/?utm_source=slashpage&utm_medium=bottomBtn&utm_campaign=241001"
          >
            PrayU 지금 시작
          </a>

          <p className="text-gray-600 mt-6">문의: team.visioneer15@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
