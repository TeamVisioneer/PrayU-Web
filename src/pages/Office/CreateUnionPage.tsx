import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { groupUnionController } from "@/apis/office/groupUnionController";
import useAuth from "@/hooks/useAuth";
import useOfficeStore from "@/stores/officeStore";

// 스텝별 프로그래스 컴포넌트
const ProgressBar = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  // 도트 기반 프로그래스 바 생성
  const renderDots = () => {
    const dots = [];

    for (let i = 1; i <= totalSteps; i++) {
      // 각 단계별 라벨
      const stepLabel =
        i === 1 ? "교회 정보" : i === 2 ? "공동체 정보" : "완료";

      if (i > 1) {
        // 연결선 추가 (첫 번째 도트 제외하고 그 앞에 선 추가)
        dots.push(
          <div
            key={`line-${i - 1}`}
            className="flex-1 flex items-center justify-center mx-1 relative"
          >
            <div
              className={`h-1 w-11/12 absolute top-4 ${
                i <= currentStep ? "bg-blue-500" : "bg-gray-200"
              }`}
            ></div>
          </div>
        );
      }

      // 도트 추가
      dots.push(
        <div key={i} className="flex flex-col items-center z-10 relative w-14">
          {/* 도트 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm 
              ${
                i < currentStep
                  ? "bg-blue-500 text-white" // 완료된 단계
                  : i === currentStep
                  ? "bg-blue-500 text-white border-4 border-blue-200" // 현재 단계
                  : "bg-gray-200 text-gray-500"
              }
            `}
          >
            {i}
          </div>

          {/* 단계 라벨 */}
          <span
            className={`text-xs mt-1 ${
              i === currentStep ? "font-medium text-blue-700" : "text-gray-500"
            }`}
          >
            {stepLabel}
          </span>
        </div>
      );
    }

    return dots;
  };

  return (
    <div className="w-full mt-4 mb-8">
      <div className="flex justify-between items-start px-2">
        {renderDots()}
      </div>
    </div>
  );
};

// 공동체 설명 컴포넌트
const UnionDescription = () => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-6">
      <h3 className="font-bold text-blue-900 mb-2">공동체란?</h3>
      <p className="text-blue-800 text-sm">
        공동체는 여러 그룹들의 집합입니다. 공동체를 생성하면 공동체의 사역자가
        소속된 그룹들의 기도 현황을 한눈에 볼 수 있습니다.
      </p>
      <p className="text-blue-800 text-sm mt-2">
        공동체 생성 후, 그룹장들에게 공동체 초대를 보내 그룹들을 공동체에 연결할
        수 있습니다.
      </p>
      <p className="text-blue-800 text-sm mt-2 font-medium">
        예시: 청년부(공동체) → 1,2,3 셀(그룹들)
      </p>
    </div>
  );
};

// 스텝 1: 교회 이름 입력
const Step1 = ({
  church,
  setChurch,
  onNext,
}: {
  church: string;
  setChurch: (value: string) => void;
  onNext: () => void;
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-900">교회 정보 입력</h2>
      <p className="text-gray-600">소속 교회의 이름을 입력해주세요.</p>

      <UnionDescription />

      <div className="space-y-4">
        <div>
          <label
            htmlFor="church"
            className="block text-sm font-medium mb-1 text-blue-900"
          >
            교회 이름
          </label>
          <Input
            id="church"
            placeholder="예) 00교회"
            value={church}
            onChange={(e) => setChurch(e.target.value)}
            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="">
        <Button
          className="w-full bg-blue-500 hover:bg-blue-600"
          onClick={onNext}
          disabled={!church.trim()}
        >
          다음
        </Button>
      </div>
    </div>
  );
};

// 스텝 2: 공동체 정보 입력
const Step2 = ({
  name,
  setName,
  intro,
  setIntro,
  onPrev,
  onNext,
  isLoading,
}: {
  name: string;
  setName: (value: string) => void;
  intro: string;
  setIntro: (value: string) => void;
  onPrev: () => void;
  onNext: () => void;
  isLoading?: boolean;
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-900">공동체 정보 입력</h2>
      <p className="text-gray-600">새로운 공동체의 정보를 입력해주세요.</p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-1 text-blue-900"
          >
            공동체 이름
          </label>
          <Input
            id="name"
            placeholder="예) 청년부, 대학부, 주일학교 등"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="intro"
            className="block text-sm font-medium mb-1 text-blue-900"
          >
            공동체 소개
          </label>
          <Textarea
            id="intro"
            placeholder="공동체에 대한 간단한 소개를 작성해주세요."
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={4}
            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={isLoading}
          className="border-blue-300 text-blue-500 hover:bg-blue-50"
        >
          이전
        </Button>
        <Button
          onClick={onNext}
          disabled={!name.trim() || isLoading}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              생성 중...
            </>
          ) : (
            "공동체 생성하기"
          )}
        </Button>
      </div>
    </div>
  );
};

// 스텝 3: 완료 및 초대
const Step3 = ({
  groupUnionData,
  onComplete,
}: {
  groupUnionData: {
    church: string;
    name: string;
    intro: string;
  };
  onComplete: () => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-6">
        <CheckCircle className="w-16 h-16 text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold text-center text-blue-900">
          공동체 생성 완료!
        </h2>
        <p className="text-gray-600 text-center mt-2">
          {groupUnionData.church}의 {groupUnionData.name} 공동체가 성공적으로
          생성되었습니다.
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2 text-blue-900">공동체 정보</h3>
        <p>
          <span className="font-medium text-blue-800">교회:</span>{" "}
          <span className="text-blue-700">{groupUnionData.church}</span>
        </p>
        <p>
          <span className="font-medium text-blue-800">공동체명:</span>{" "}
          <span className="text-blue-700">{groupUnionData.name}</span>
        </p>
        <p>
          <span className="font-medium text-blue-800">소개:</span>{" "}
          <span className="text-blue-700">
            {groupUnionData.intro || "소개 없음"}
          </span>
        </p>
      </div>

      <div className="pt-4 space-y-3">
        <Button
          className="w-full bg-blue-500 hover:bg-blue-600"
          onClick={() => {
            // 초대 메세지 보내기 로직 구현
            toast({
              title: "초대 메시지 전송",
              description: "그룹장에게 초대 메시지가 전송되었습니다.",
            });
          }}
        >
          그룹장에게 공동체 등록 요청하기
        </Button>

        <Button
          variant="outline"
          className="w-full border-blue-300 text-blue-500 hover:bg-blue-50"
          onClick={onComplete}
        >
          생성한 공동체 보기
        </Button>
      </div>
    </div>
  );
};

const CreateUnionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchMyUnions } = useOfficeStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    church: "",
    name: "",
    intro: "",
  });
  const [loading, setLoading] = useState(false);
  const [createdUnionId, setCreatedUnionId] = useState<string | null>(null);

  const handleCreateGroupUnion = async () => {
    setLoading(true);
    try {
      // GroupUnionController를 사용하여 공동체 생성
      const newUnion = await groupUnionController.createGroupUnion({
        church: formData.church,
        name: formData.name,
        intro: formData.intro,
      });

      if (!newUnion) {
        throw new Error("공동체 생성에 실패했습니다.");
      }

      // 생성된 공동체 ID 저장
      setCreatedUnionId(newUnion.id);

      // 사용자의 공동체 목록 갱신
      if (user?.id) {
        fetchMyUnions(user.id);
      }

      // 성공 시 다음 단계로 이동
      setCurrentStep(3);
    } catch (error) {
      console.error("Error creating group union:", error);
      toast({
        title: "오류 발생",
        description: "공동체 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleGoToNextStep = () => {
    if (currentStep < 3) {
      if (currentStep === 2) {
        // Step 2에서 다음으로 넘어갈 때 생성 API 호출
        handleCreateGroupUnion();
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handleComplete = () => {
    // 생성된 공동체의 ID가 있으면 해당 공동체 상세 페이지로 이동
    if (createdUnionId) {
      navigate(`/office/union/${createdUnionId}`);
    } else {
      // ID가 없으면 공동체 목록으로 이동
      navigate("/office/union");
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      {/* 헤더 */}
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (currentStep > 1) {
              handleGoToPreviousStep();
            } else {
              navigate(-1);
            }
          }}
          className="text-blue-600 hover:bg-blue-50 w-fit"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold ml-2 text-blue-900">
          {currentStep === 1
            ? "새 공동체 생성"
            : currentStep === 2
            ? "공동체 정보 입력"
            : "공동체 생성 완료"}
        </h1>
      </div>

      {/* 프로그래스 바 */}
      <ProgressBar currentStep={currentStep} totalSteps={3} />

      {/* 스텝별 컨텐츠 */}
      <div className="mt-4">
        {currentStep === 1 && (
          <Step1
            church={formData.church}
            setChurch={(value) =>
              setFormData((prev) => ({ ...prev, church: value }))
            }
            onNext={handleGoToNextStep}
          />
        )}

        {currentStep === 2 && (
          <Step2
            name={formData.name}
            setName={(value) =>
              setFormData((prev) => ({ ...prev, name: value }))
            }
            intro={formData.intro}
            setIntro={(value) =>
              setFormData((prev) => ({ ...prev, intro: value }))
            }
            onPrev={handleGoToPreviousStep}
            onNext={handleGoToNextStep}
            isLoading={loading}
          />
        )}

        {currentStep === 3 && (
          <Step3 groupUnionData={formData} onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
};

export default CreateUnionPage;
