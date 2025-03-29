import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { groupUnionController } from "@/apis/office/groupUnionController";
import {
  GroupUnionWithProfiles,
  GroupWithProfiles,
} from "../../../supabase/types/tables";
import useAuth from "@/hooks/useAuth";
import { groupController } from "@/apis/office/groupController";
import { updateGroup } from "@/apis/group";

// Extend the updateGroupParams to include group_union_id
interface ExtendedGroupParams {
  name?: string;
  intro?: string;
  user_id?: string;
  group_union_id?: string;
}

// Enum for join steps
enum JoinStep {
  INVITATION = 0,
  SELECT_GROUP = 1,
  CONFIRM = 2,
  COMPLETE = 3,
}

const UnionJoinPage: React.FC = () => {
  const { unionId } = useParams<{ unionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // States
  const [currentStep, setCurrentStep] = useState<JoinStep>(JoinStep.INVITATION);
  const [unionData, setUnionData] = useState<GroupUnionWithProfiles | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [myGroups, setMyGroups] = useState<GroupWithProfiles[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<GroupWithProfiles[]>([]);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load union data and user's groups
  useEffect(() => {
    const fetchData = async () => {
      if (!unionId || !user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1. Get union details
        const unionDetails = await groupUnionController.getGroupUnion(unionId);
        if (!unionDetails) {
          setError("공동체 정보를 찾을 수 없습니다");
          setLoading(false);
          return;
        }
        setUnionData(unionDetails);

        // 2. Get groups where the user is a leader
        const leaderGroups = await groupController.fetchGroupListByUserId(
          user.id
        );
        if (leaderGroups) {
          const leaderGroupsWithMe = leaderGroups.filter((group) => {
            return group.member?.some((member) => member.user_id === user.id);
          });
          setMyGroups(leaderGroupsWithMe);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [unionId, user]);

  // Move to next step
  const goToNextStep = () => {
    setCurrentStep((prev) => {
      if (prev === JoinStep.INVITATION) return JoinStep.SELECT_GROUP;
      if (prev === JoinStep.SELECT_GROUP) return JoinStep.CONFIRM;
      if (prev === JoinStep.CONFIRM) return JoinStep.COMPLETE;
      return prev;
    });
  };

  // Move to previous step
  const goToPrevStep = () => {
    setCurrentStep((prev) => {
      if (prev === JoinStep.CONFIRM) return JoinStep.SELECT_GROUP;
      if (prev === JoinStep.SELECT_GROUP) return JoinStep.INVITATION;
      if (prev === JoinStep.COMPLETE) return JoinStep.INVITATION;
      return prev;
    });
  };

  // Handle group selection
  const handleSelectGroup = (group: GroupWithProfiles) => {
    setSelectedGroups((prev) => {
      const isSelected = prev.some((g) => g.id === group.id);
      if (isSelected) {
        return prev.filter((g) => g.id !== group.id);
      } else {
        return [...prev, group];
      }
    });
  };

  // Handle union join
  const handleJoinUnion = async () => {
    if (selectedGroups.length === 0 || !unionId || !user) return;

    setJoinLoading(true);
    try {
      // Update each selected group's union_id
      const updatePromises = selectedGroups.map((group) =>
        updateGroup(group.id, {
          group_union_id: unionId,
        } as ExtendedGroupParams)
      );

      const results = await Promise.all(updatePromises);
      const allSuccess = results.every((result) => result !== null);

      if (allSuccess) {
        goToNextStep();
      } else {
        setError("공동체 등록 요청 수락 중 오류가 발생했습니다");
      }
    } catch (err) {
      console.error("Error joining union:", err);
      setError("공동체 등록 요청 수락 중 오류가 발생했습니다");
    } finally {
      setJoinLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error || !unionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {error || "공동체를 찾을 수 없습니다"}
        </h2>
        <p className="text-gray-600 mb-6">
          요청하신 공동체 정보를 찾을 수 없습니다. 다른 공동체를 선택해주세요.
        </p>
        <button
          onClick={() => navigate("/office/union")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          공동체 목록으로 돌아가기
        </button>
      </div>
    );
  }

  // Render step-by-step UI
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm border-b border-gray-200 z-20">
        <div className="flex items-center h-14 px-4">
          {currentStep > 0 ? (
            <button onClick={goToPrevStep} className="p-2 -ml-2 text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => navigate("/office/union")}
              className="p-2 -ml-2 text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-medium flex-1 text-center">
            공동체 등록 요청 수락
          </h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Progress indicator - moved below header */}
      <div className="w-full h-1 bg-gray-200">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-5 pb-24 max-w-md">
        {/* Step 1: Invitation */}
        {currentStep === JoinStep.INVITATION && (
          <div className="flex flex-col space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {unionData.name} 공동체 초대
              </h2>
              <p className="text-gray-600 mb-2">
                {unionData.church || "교회 정보 없음"}
              </p>
              {unionData.intro && (
                <p className="text-gray-500">{unionData.intro}</p>
              )}
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-4">
                {unionData.profiles.full_name
                  ? `${unionData.profiles.full_name}님이 공동체 등록을 요청하셨습니다.`
                  : "공동체 등록 요청을 수락하시겠습니까?"}
              </h3>
              <p className="text-gray-600 text-sm">
                등록 요청 수락 과정은 이후 단계를 통해 진행됩니다. 소그룹장이신
                경우, 다음 단계에서 소그룹을 선택하실 수 있습니다.
              </p>
            </div>

            <button
              onClick={goToNextStep}
              className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              다음
            </button>
          </div>
        )}

        {/* Step 2: Select Group */}
        {currentStep === JoinStep.SELECT_GROUP && (
          <div className="flex flex-col space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                등록할 그룹 선택
              </h2>
              <p className="text-gray-600">
                공동체에 등록할 그룹을 선택해주세요
              </p>
            </div>

            {myGroups.length === 0 ? (
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center">
                <p className="text-gray-600 mb-4">
                  그룹장으로 있는 그룹이 없습니다.
                </p>
                <p className="text-sm text-gray-500">
                  그룹장인 그룹만 공동체에 등록할 수 있습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <h3 className="px-2 text-lg font-medium text-gray-900">
                  내가 만든 그룹
                </h3>
                <div className="space-y-3 p-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {myGroups.map((group) => (
                    <div
                      key={group.id}
                      onClick={() => handleSelectGroup(group)}
                      className={`bg-white rounded-lg p-4 border ${
                        selectedGroups.some((g) => g.id === group.id)
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200"
                      } cursor-pointer transition-all hover:bg-gray-50`}
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {group.name}
                          </h3>
                          {group.member && group.member.length > 0 && (
                            <div className="mt-3 flex items-center">
                              <div className="flex -space-x-2">
                                {group.member?.slice(0, 3).map((member) => (
                                  <div
                                    key={member.id}
                                    className="relative"
                                    title={
                                      member.profiles?.full_name || "Unknown"
                                    }
                                  >
                                    <img
                                      src={
                                        member.profiles?.avatar_url ||
                                        "/images/defaultProfileImage.png"
                                      }
                                      alt={
                                        member.profiles?.full_name || "Unknown"
                                      }
                                      className="w-8 h-8 rounded-full border-2 border-white"
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.src = "/defaultProfileImage.png";
                                      }}
                                    />
                                  </div>
                                ))}
                                {group.member?.length > 3 && (
                                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                    +{group.member?.length - 3}
                                  </div>
                                )}
                              </div>
                              <div className="ml-3 flex items-center">
                                <span className="text-sm text-gray-600 mr-1">
                                  {group.member
                                    ?.slice(0, 3)
                                    .map((member, index) => (
                                      <span key={member.id}>
                                        {member.profiles?.full_name ||
                                          "(알 수 없음)"}
                                        {index <
                                        Math.min(group.member?.length || 0, 3) -
                                          1
                                          ? ", "
                                          : ""}
                                      </span>
                                    ))}
                                  {group.member?.length > 3 && "..."}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {group.member?.length || 0}명
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        {selectedGroups.some((g) => g.id === group.id) && (
                          <div className="bg-blue-500 text-white rounded-full p-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <button
                onClick={goToNextStep}
                disabled={selectedGroups.length === 0 || myGroups.length === 0}
                className={`w-full py-3 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  selectedGroups.length > 0 && myGroups.length > 0
                    ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                다음
              </button>

              <button
                onClick={goToPrevStep}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                이전 단계로
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === JoinStep.CONFIRM && selectedGroups.length > 0 && (
          <div className="flex flex-col space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                등록 요청 확인
              </h2>
              <p className="text-gray-600">
                아래 정보를 확인하고 등록 요청을 수락해주세요
              </p>
            </div>

            {/* 공동체 정보와 그룹 정보를 하나의 섹션에 통합 */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              {/* 공동체 정보 */}
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                공동체 정보
              </h3>
              <div className="flex items-center p-2 mb-5">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center mr-3 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {unionData.name}
                  </h4>
                  <div className="flex flex-wrap items-center mt-1 text-sm text-gray-500">
                    <span className="font-medium text-gray-600">
                      {unionData.church || "교회 정보 없음"}
                    </span>
                    {unionData.intro && (
                      <>
                        <span className="mx-1.5">•</span>
                        <span className="line-clamp-1">{unionData.intro}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 그룹 정보 */}
              <h3 className="text-lg font-medium text-gray-900 mt-4 mb-3">
                선택한 그룹
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-2">
                {selectedGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {group.name}
                        </h3>
                        {group.member && group.member.length > 0 && (
                          <div className="mt-3 flex items-center">
                            <div className="flex -space-x-2">
                              {group.member?.slice(0, 3).map((member) => (
                                <div
                                  key={member.id}
                                  className="relative"
                                  title={
                                    member.profiles?.full_name || "Unknown"
                                  }
                                >
                                  <img
                                    src={
                                      member.profiles?.avatar_url ||
                                      "/images/defaultProfileImage.png"
                                    }
                                    alt={
                                      member.profiles?.full_name || "Unknown"
                                    }
                                    className="w-8 h-8 rounded-full border-2 border-white"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src = "/defaultProfileImage.png";
                                    }}
                                  />
                                </div>
                              ))}
                              {group.member?.length > 3 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                  +{group.member?.length - 3}
                                </div>
                              )}
                            </div>
                            <div className="ml-3 flex items-center">
                              <span className="text-sm text-gray-600 mr-1">
                                {group.member
                                  ?.slice(0, 3)
                                  .map((member, index) => (
                                    <span key={member.id}>
                                      {member.profiles?.full_name ||
                                        "(알 수 없음)"}
                                      {index <
                                      Math.min(group.member?.length || 0, 3) - 1
                                        ? ", "
                                        : ""}
                                    </span>
                                  ))}
                                {group.member?.length > 3 && "..."}
                              </span>
                              <span className="text-sm text-gray-500">
                                {group.member?.length || 0}명
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleJoinUnion}
                disabled={joinLoading}
                className={`w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                  joinLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {joinLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    <span>처리 중...</span>
                  </div>
                ) : (
                  "등록 요청 수락하기"
                )}
              </button>

              <button
                onClick={goToPrevStep}
                disabled={joinLoading}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                이전 단계로
              </button>

              {/* 경고 메시지를 버튼 그룹 하단으로 이동 */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mt-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-yellow-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      등록 후에는 공동체 관리자의 승인 없이 해당 그룹을
                      공동체에서 제외할 수 없습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Completion */}
        {currentStep === JoinStep.COMPLETE && (
          <div className="flex flex-col items-center space-y-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                등록 요청 완료
              </h2>
              <p className="text-gray-600">
                선택하신 그룹이 {unionData.name} 공동체에 등록되었습니다.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm w-full">
              <h3 className="font-medium text-gray-900 mb-4">등록된 그룹</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {selectedGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white rounded-lg p-4 border border-gray-200 transition-all"
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {group.name}
                        </h3>

                        {group.member && group.member.length > 0 && (
                          <div className="mt-3 flex items-center">
                            <div className="flex -space-x-2">
                              {group.member?.slice(0, 3).map((member) => (
                                <div
                                  key={member.id}
                                  className="relative"
                                  title={
                                    member.profiles?.full_name || "Unknown"
                                  }
                                >
                                  <img
                                    src={
                                      member.profiles?.avatar_url ||
                                      "/images/defaultProfileImage.png"
                                    }
                                    alt={
                                      member.profiles?.full_name || "Unknown"
                                    }
                                    className="w-8 h-8 rounded-full border-2 border-white"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src = "/defaultProfileImage.png";
                                    }}
                                  />
                                </div>
                              ))}
                              {group.member?.length > 3 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                  +{group.member?.length - 3}
                                </div>
                              )}
                            </div>
                            <div className="ml-3 flex items-center">
                              <span className="text-sm text-gray-600 mr-1">
                                {group.member
                                  ?.slice(0, 3)
                                  .map((member, index) => (
                                    <span key={member.id}>
                                      {member.profiles?.full_name ||
                                        "(알 수 없음)"}
                                      {index <
                                      Math.min(group.member?.length || 0, 3) - 1
                                        ? ", "
                                        : ""}
                                    </span>
                                  ))}
                                {group.member?.length > 3 && "..."}
                              </span>
                              <span className="text-sm text-gray-500">
                                {group.member?.length || 0}명
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate("/group")}
              className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              내 그룹으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnionJoinPage;
