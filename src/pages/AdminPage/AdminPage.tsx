import { useEffect, useState } from "react";
import { FaLock } from "react-icons/fa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainHeader from "../MainPage/MainHeader";
import useAuth from "@/hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import OverviewTab from "./tabs/OverviewTab";
import GroupsTab from "./tabs/GroupsTab";
import UsageTab from "./tabs/UsageTab";
import OperationsTab from "./tabs/OperationsTab";

const PERIOD_OPTIONS = [
  { label: "7일", days: 7 },
  { label: "30일", days: 30 },
  { label: "90일", days: 90 },
];

const AdminPage = () => {
  const { user } = useAuth();
  const myProfile = useBaseStore((state) => state.myProfile);
  const getProfile = useBaseStore((state) => state.getProfile);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (user) getProfile(user.id);
  }, [user, getProfile]);

  if (!user || (myProfile && !myProfile.is_admin)) {
    return (
      <div className="w-ful flex h-full flex-col items-center justify-center">
        <MainHeader />
        <div className="flex flex-col items-center justify-center gap-3">
          <FaLock size={50} />
          <div className="text-gray-500">관리자 계정으로 접근해 주세요</div>
        </div>
      </div>
    );
  }

  // 권한 판정 전에는 잠금 화면이 깜빡이지 않도록 대기
  if (!myProfile) {
    return (
      <div className="w-ful flex h-full flex-col items-center justify-center">
        <MainHeader />
        <div className="text-gray-500">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-grow flex-col items-center gap-4 px-5 pt-14">
      <MainHeader />

      <div className="flex w-full items-center justify-between">
        <h1 className="text-lg font-bold">어드민</h1>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.days}
              onClick={() => setDays(option.days)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                days === option.days
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full pb-16">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="groups">그룹</TabsTrigger>
          <TabsTrigger value="usage">사용·비용</TabsTrigger>
          <TabsTrigger value="operations">운영</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab days={days} />
        </TabsContent>
        <TabsContent value="groups" className="mt-4">
          <GroupsTab />
        </TabsContent>
        <TabsContent value="usage" className="mt-4">
          <UsageTab days={days} />
        </TabsContent>
        <TabsContent value="operations" className="mt-4">
          <OperationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
