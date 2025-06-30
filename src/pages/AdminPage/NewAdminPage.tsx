import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import MainHeader from "../MainPage/MainHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaLock, FaUsers, FaPray, FaCrown, FaHeart } from "react-icons/fa";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const NewAdminPage = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data based on database schema
  const mockDailyUsers = [
    { date: "2024-01-15", newUsers: 12, totalUsers: 1234 },
    { date: "2024-01-16", newUsers: 8, totalUsers: 1242 },
    { date: "2024-01-17", newUsers: 15, totalUsers: 1257 },
    { date: "2024-01-18", newUsers: 23, totalUsers: 1280 },
    { date: "2024-01-19", newUsers: 19, totalUsers: 1299 },
    { date: "2024-01-20", newUsers: 31, totalUsers: 1330 },
    { date: "2024-01-21", newUsers: 28, totalUsers: 1358 },
  ];

  const mockDailyGroups = [
    { date: "2024-01-15", newGroups: 3, totalGroups: 156 },
    { date: "2024-01-16", newGroups: 2, totalGroups: 158 },
    { date: "2024-01-17", newGroups: 5, totalGroups: 163 },
    { date: "2024-01-18", newGroups: 7, totalGroups: 170 },
    { date: "2024-01-19", newGroups: 4, totalGroups: 174 },
    { date: "2024-01-20", newGroups: 9, totalGroups: 183 },
    { date: "2024-01-21", newGroups: 6, totalGroups: 189 },
  ];

  const mockDailyPrays = [
    { date: "2024-01-15", newPrays: 87, totalPrays: 5234 },
    { date: "2024-01-16", newPrays: 92, totalPrays: 5326 },
    { date: "2024-01-17", newPrays: 105, totalPrays: 5431 },
    { date: "2024-01-18", newPrays: 134, totalPrays: 5565 },
    { date: "2024-01-19", newPrays: 127, totalPrays: 5692 },
    { date: "2024-01-20", newPrays: 156, totalPrays: 5848 },
    { date: "2024-01-21", newPrays: 143, totalPrays: 5991 },
  ];

  const mockGroupActivity = [
    {
      name: "새가족 기도모임",
      members: 12,
      prayCards: 8,
      recentPrays: 45,
      growth: "+15%",
    },
    {
      name: "청년부 기도팀",
      members: 24,
      prayCards: 15,
      recentPrays: 78,
      growth: "+8%",
    },
    {
      name: "직장인 새벽기도",
      members: 18,
      prayCards: 12,
      recentPrays: 56,
      growth: "+22%",
    },
    {
      name: "엄마들의 기도",
      members: 31,
      prayCards: 22,
      recentPrays: 89,
      growth: "+12%",
    },
    {
      name: "학생 기도동아리",
      members: 9,
      prayCards: 6,
      recentPrays: 23,
      growth: "+5%",
    },
  ];

  const mockTopUsers = [
    {
      name: "김민수",
      totalPrays: 234,
      prayCards: 12,
      joinedGroups: 3,
      avatar: "1",
    },
    {
      name: "이서영",
      totalPrays: 198,
      prayCards: 15,
      joinedGroups: 4,
      avatar: "2",
    },
    {
      name: "박준호",
      totalPrays: 187,
      prayCards: 9,
      joinedGroups: 2,
      avatar: "3",
    },
    {
      name: "최지현",
      totalPrays: 176,
      prayCards: 11,
      joinedGroups: 3,
      avatar: "1",
    },
    {
      name: "정태훈",
      totalPrays: 165,
      prayCards: 8,
      joinedGroups: 2,
      avatar: "2",
    },
  ];

  const mockPrayTypeData = [
    { name: "감사", value: 35, color: "#8B5CF6" },
    { name: "간구", value: 28, color: "#06B6D4" },
    { name: "회개", value: 15, color: "#F59E0B" },
    { name: "찬양", value: 12, color: "#10B981" },
    { name: "기타", value: 10, color: "#F43F5E" },
  ];

  const COLORS = ["#8B5CF6", "#06B6D4", "#F59E0B", "#10B981", "#F43F5E"];

  // Authentication check
  if (
    !user ||
    !["team.visioneer15@gmail.com", "s2615s@naver.com"].includes(
      user.user_metadata.email
    )
  ) {
    return (
      <div className="h-full w-full flex flex-col justify-center items-center">
        <MainHeader />
        <div className="flex flex-col gap-3 justify-center items-center">
          <FaLock size={50} />
          <div className="text-gray-500">관리자 계정으로 접근해 주세요</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full min-h-screen bg-gray-50 pt-14">
      <MainHeader />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              PrayU 어드민 대시보드
            </h1>
            <p className="text-gray-600 mt-1">
              서비스 운영 현황을 한 눈에 확인하세요
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">최근 7일</SelectItem>
                <SelectItem value="30d">최근 30일</SelectItem>
                <SelectItem value="90d">최근 90일</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="users">사용자</TabsTrigger>
            <TabsTrigger value="groups">그룹</TabsTrigger>
            <TabsTrigger value="prays">기도</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    총 사용자
                  </CardTitle>
                  <FaUsers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,358</div>
                  <p className="text-xs text-muted-foreground">
                    +28 from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    활성 그룹
                  </CardTitle>
                  <FaCrown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">189</div>
                  <p className="text-xs text-muted-foreground">
                    +6 from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    총 기도 수
                  </CardTitle>
                  <FaPray className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5,991</div>
                  <p className="text-xs text-muted-foreground">
                    +143 from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    오늘 활성 사용자
                  </CardTitle>
                  <FaHeart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">456</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from yesterday
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Users Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>일별 신규 사용자</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockDailyUsers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          new Date(value).getMonth() +
                          1 +
                          "/" +
                          new Date(value).getDate()
                        }
                      />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="newUsers"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pray Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>기도 유형 분포</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockPrayTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${((percent || 0) * 100).toFixed(0)}%`
                        }
                      >
                        {mockPrayTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Activity Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Performing Groups */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>활발한 그룹 TOP 5</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {mockGroupActivity.map((group, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{group.name}</p>
                              <p className="text-sm text-gray-500">
                                멤버 {group.members}명 • 기도카드{" "}
                                {group.prayCards}개
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {group.recentPrays}
                            </p>
                            <Badge
                              variant="secondary"
                              className="text-green-600"
                            >
                              {group.growth}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Top Users */}
              <Card>
                <CardHeader>
                  <CardTitle>활발한 사용자</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {mockTopUsers.map((user, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 border rounded-lg"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name[0]}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">
                              기도 {user.totalPrays}회
                            </p>
                          </div>
                          <div className="text-xs text-center">
                            <p className="font-bold">{index + 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>사용자 성장 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={mockDailyUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).getMonth() +
                        1 +
                        "/" +
                        new Date(value).getDate()
                      }
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="newUsers"
                      stroke="#8B5CF6"
                      name="신규 사용자"
                    />
                    <Line
                      type="monotone"
                      dataKey="totalUsers"
                      stroke="#06B6D4"
                      name="총 사용자"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>그룹 생성 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mockDailyGroups}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).getMonth() +
                        1 +
                        "/" +
                        new Date(value).getDate()
                      }
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="newGroups" fill="#10B981" name="신규 그룹" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prays Tab */}
          <TabsContent value="prays" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>기도 활동 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={mockDailyPrays}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).getMonth() +
                        1 +
                        "/" +
                        new Date(value).getDate()
                      }
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="newPrays"
                      stackId="1"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      name="일일 기도"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NewAdminPage;
