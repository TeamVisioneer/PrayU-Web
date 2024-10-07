import StartPrayUBtn from "./StartPrayUBtn";

const StoryPage = () => {
  return (
    <div className="flex flex-grow flex-col justify-center text-center w-full items-center bg-white ">
      <img
        src="/images/story/cover.png"
        className="w-full max-w-[600px] h-auto"
      />
      <div className="font-sans text-center">
        <div className="container max-w-screen-lg mx-auto px-4 py-10">
          <h1 className="text-2xl mt-6 font-bold">카톡방 속 답장 없는</h1>
          <h1 className="text-2xl font-bold">
            <span className="underline text-purple-600">기도제목 나눔</span>은
            이제 그만!
          </h1>
          <h2 className="text-xl mt-5">이제는 그룹원들과</h2>
          <h2 className="text-xl">
            <span className="text-purple-600 font-bold">
              지속적으로 소통하며
            </span>{" "}
            기도해요
          </h2>
          <div className="h-20"></div>

          <StartPrayUBtn eventOption={{ where: "topBtn" }} />
          <div className="h-8"></div>
          <h3 className="mt-6">.</h3>
          <h3 className="mt-3">.</h3>
          <h3 className="mt-3">.</h3>
          <div className="h-8"></div>

          <div className="image-container mt-10">
            <img src="/images/story/tired.png" className="mx-auto h-[168px] " />
          </div>

          <p className="mt-6">오늘도 힘쓰고 계실 그룹장 및 리더 여러분</p>
          <p className="mt-2">다들 이런 고민 한 번쯤은 해보시지 않았나요?</p>

          <div className="h-20"></div>

          <blockquote className="mt-4 italic">
            <p>" 그룹원들의 기도 활성화를 위해서는"</p>
            <p>" 무엇부터 해야하지.. "</p>
            <div className="h-10"></div>
            <p>" 우리 그룹원들도"</p>
            <p>" 주기적으로 기도제목을 올렸으면 좋겠다.. "</p>
            <div className="h-10"></div>
            <p>" 그룹원들과 지속적으로 기도 하고 싶다... "</p>
          </blockquote>

          <div className="h-8"></div>
          <h3 className="mt-6">.</h3>
          <h3 className="mt-3">.</h3>
          <h3 className="mt-3">.</h3>
          <div className="h-8"></div>

          <p className="mt-2">사실 이 고민 모두 제 이야기입니다...😂</p>

          <div className="image-container mt-8">
            <img src="/images/story/itsme.png" className="mx-auto h-[108px]" />
          </div>

          <div className="h-20"></div>

          <p className="mt-2">기도 제목을 나눠도 반응은 없고,</p>
          <p className="mt-2">함께 기도하고 싶은 마음만 앞섰던 것 같네요</p>

          <div className="h-8"></div>
          <h3 className="mt-6">.</h3>
          <h3 className="mt-3">.</h3>
          <h3 className="mt-3">.</h3>
          <div className="h-8"></div>

          <h2 className="text-2xl font-semibold mt-10">
            문제를 차근차근 다시 보았어요 🔍
          </h2>

          <div className="image-container mt-8">
            <img
              src="/images/story/problem1.png"
              className="mx-auto h-[217px]"
            />
          </div>

          <p className="mt-6">근본적으로는 카톡 채팅방 내에서</p>
          <p className="mt-2">
            <span className="text-red-500 font-bold">지속적인 나눔</span>에
            한계가 보였습니다.
          </p>
          <p className="mt-2">카톡방에서의 활성화 방안들이</p>
          <p className="mt-2">실제로 효과가 많이 있을지 고민되었어요.</p>

          <div className="h-32   "></div>

          <div className="image-container mt-8">
            <img
              src="/images/story/problem2.png"
              className="mx-auto  h-[200px]"
            />
          </div>

          <p className="mt-6">기도제목을 나누더라도</p>
          <p className="mt-2">한 주 동안 지속적으로 노출되기 어려웠고</p>

          <div className="h-32"></div>

          <div className="image-container mt-8">
            <img
              src="/images/story/problem3.png"
              className="mx-auto h-[331px]"
            />
          </div>

          <p className="mt-6">기도제목에 대한 반응 또한</p>
          <p className="mt-2">
            이모티콘으로 충분하지 않다는 생각이 들었습니다.
          </p>

          <div className="h-32"></div>

          <p className="mt-6">최종적으로</p>
          <p className="mt-2">함께 기도하고자 하는 사람들을 위해서는</p>
          <p className="mt-2">
            <span className="text-purple-600 font-bold">
              다른 형태의 기도제목 공유
            </span>
            가
          </p>
          <p className="mt-2">이루어져야 한다고 생각했어요.</p>

          <div className="h-8"></div>
          <h3 className="mt-6">.</h3>
          <h3 className="mt-3">.</h3>
          <h3 className="mt-3">.</h3>
          <div className="h-8"></div>

          <div className="section mt-10">
            <h1 className="text-2xl font-semibold text-red-500">그.래.서</h1>
            <h3 className=" font-semibold mt-6 text-red-500">결심했습니다</h3>
            <div className="image-container mt-8">
              <img src="/images/story/nada.png" className="mx-auto h-[128px]" />
            </div>

            <p className="mt-7 ">기도제목의 공유를 위한 프로그램을</p>
            <p className="mt-2">제가 직접 만들어보기로 ⭐</p>
            <p className="mt-7">
              <span className="text-purple-600 font-bold">본업이 개발자</span>
              이기도 하고
            </p>
            <p className="mt-2">
              <span className="text-purple-600 font-bold">
                교회의 나눔 문화에 익숙
              </span>
              한 만큼
            </p>
            <p className="mt-7 ">이런 문제점을 잘 반영하여</p>
            <p className="mt-2">좋은 해결책을 만들 수 있겠다고 생각했어요</p>

            <div className="h-32 "></div>

            <StartPrayUBtn eventOption={{ where: "middleBtn" }} />
          </div>

          <div className="section mt-10">
            <h2 className="text-2xl font-semibold mt-28 ">
              이렇게 해결했어요 😊
            </h2>
            <div className="image-container mt-8">
              <img
                src="/images/story/solve1.png"
                className="mx-auto h-[350px]"
              />
            </div>
            <p className="mt-6">우리 소그룹 내에서 먼저 사용해보고자</p>
            <p className="mt-2">그룹기반 기도제목 나눔 서비스를</p>
            <p className="mt-2">
              <span className="bg-yellow-200 font-bold">카카오톡 버전</span>으로
              만들어 보았어요
            </p>
          </div>

          <div className="section mt-10">
            <div className="image-container mt-8">
              <img
                src="/images/story/solve2.png"
                className="mx-auto h-[350px]"
              />
            </div>
            <p className="mt-6">그룹원들이 기도제목을 작성하면</p>
            <p className="mt-2">일주일 동안 기도제목을 넘기면서</p>
            <p className="mt-2">
              <span className="text-purple-600 font-bold">매일매일</span> 서로를
              위해 기도해줄 수 있어요!
            </p>
          </div>

          <div className="section mt-10">
            <div className="image-container mt-8">
              <img
                src="/images/story/solve3.png"
                className="mx-auto h-[350px]"
              />
            </div>
            <p className="mt-6">
              <span className="bg-yellow-200 font-bold">카카오톡 버전</span>{" "}
              답게
            </p>
            <p className="mt-2">카카오톡 친화적으로 기능을 만들었어요!</p>

            <p className="mt-11 ">
              그룹 링크를 공지에 두고 채팅방에서 접근하며
            </p>
            <p className="mt-2">
              매일매일 말씀카드를 공유할 수 있도록 하였어요:)
            </p>
          </div>

          <p className="mt-28 ">그리고 제 소그룹과 주변 다른 리더들에게</p>
          <p className="mt-2">먼저 사용해보도록 도움을 요청했습니다!</p>

          <div className="h-8"></div>
          <h3 className="mt-6">.</h3>
          <h3 className="mt-3">.</h3>
          <h3 className="mt-3">.</h3>
          <div className="h-8"></div>

          <div className="section mt-10">
            <h2 className="text-2xl font-semibold">
              정말로 효과가 있었어요 😊
            </h2>
            <div className="flex flex-row">
              <div className="flex flex-col">
                <div className="image-container mt-8">
                  <img src="/images/story/result1.png" className="mx-auto " />
                </div>
                <p className="mt-6 text-sm text-gray-500">
                  우리 소그룹원의 감사 인사❤
                </p>
              </div>
              <div className="w-11"> </div>
              <div className="flex flex-col">
                <div className="image-container mt-8">
                  <img src="/images/story/result2.png" className="mx-auto" />
                </div>
                <p className="mt-6 text-sm text-gray-500">
                  일주일 사용해본 그룹장의 평가💛
                </p>
              </div>
              <div className="w-11"> </div>
              <div className="flex flex-col">
                <div className="image-container mt-8">
                  <img src="/images/story/result3.png" className="mx-auto" />
                </div>
                <p className="mt-6 text-sm text-gray-500">
                  소문을 듣고 쓰고 싶다고 한 그룹장💙
                </p>
              </div>
            </div>
          </div>
          <div className="h-32"></div>

          <p className="mt-6">실제로 여러 번 기도해주는 환경을 접해보니</p>
          <p className="mt-2">
            기도가 <span className="text-green-600 font-bold">즐겁고</span>{" "}
            구성원 서로가 더{" "}
            <span className="text-green-600 font-bold">고마워</span>진다는
          </p>
          <p className="mt-2">반응이 가장 많았어요 😊</p>

          <p className="mt-11">우리 내부에서만 쓰기에 아깝다고 느껴서</p>
          <p className="mt-2">같은 활성화 문제를 겪는 분들께도 도움을 주고</p>
          <p className="mt-2">싶다는 생각이 들었습니다.</p>

          <h3 className="text-red-600 mt-11">.</h3>

          <h2 className="text-2xl font-semibold mt-10">
            이런 목표를 갖고 있어요 😊
          </h2>
          <div className="image-container mt-8">
            <img src="/images/story/goal.png" className="mx-auto h-[265px]" />
          </div>
          <div className="h-11"></div>
          <p className="mt-6">매주 주일 기도제목을 나누고 끝나는 그룹에서</p>
          <p className="mt-2">
            매일 서로를 위해{" "}
            <span className="text-green-600 font-bold">기도하며 나누는</span>{" "}
            그룹을
          </p>
          <p className="mt-2">목표로 나아가고 있습니다.</p>

          <div className="h-32"></div>
          <h2 className="text-2xl font-semibold mt-10">
            이름은 PrayU 로 정했어요⭐
          </h2>
          <p className="mt-11">현재 그룹기반 기도제목 공유앱 PrayU 를</p>
          <p className="mt-2">새롭게 만들어가고 있습니다.</p>

          <p className="mt-11">여러분들의 도움이 필요합니다.</p>
          <p className="mt-2">교회의 나눔 활성화를 위해 노력하는 분들의</p>
          <p className="mt-2">많은 관심과 사랑이</p>
          <p className="mt-2">PrayU 를 만들어가고 있습니다.</p>

          <p className="mt-14">모두를 위한 기도제목 공유앱 PrayU 을 위해</p>
          <p className="mt-2">함께 동참해 주시길 소망합니다 🙏</p>
          <div className="h-11 "></div>

          <StartPrayUBtn eventOption={{ where: "bottomBtn" }} />

          <p className="mt-14">문의: team.visioneer15@gmail.com</p>
          <div className="h-44  "></div>
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2">
            <StartPrayUBtn eventOption={{ where: "floatingBtn" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPage;
