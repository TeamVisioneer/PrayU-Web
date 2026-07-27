import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GroupStat, fetchGroupStats } from "@/apis/admin";

type SortKey = "recent" | "members" | "cards";

const GroupsTab = () => {
  const [groups, setGroups] = useState<GroupStat[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [dormantOnly, setDormantOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchGroupStats().then((result) => {
      if (cancelled) return;
      setGroups(result);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleGroups = useMemo(() => {
    if (!groups) return [];
    const filtered = groups.filter((group) => {
      if (dormantOnly && !group.isDormant) return false;
      if (!keyword.trim()) return true;
      return group.name.toLowerCase().includes(keyword.trim().toLowerCase());
    });
    const sorted = [...filtered];
    if (sortKey === "members") {
      sorted.sort((a, b) => b.memberCount - a.memberCount);
    } else if (sortKey === "cards") {
      sorted.sort((a, b) => b.prayCardCount - a.prayCardCount);
    }
    return sorted;
  }, [groups, keyword, sortKey, dormantOnly]);

  const dormantCount = groups?.filter((group) => group.isDormant).length ?? 0;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="그룹 이름 검색"
          className="md:w-64"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="recent">최신 개설순</option>
          <option value="members">멤버 많은순</option>
          <option value="cards">기도카드 많은순</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={dormantOnly}
            onChange={(e) => setDormantOnly(e.target.checked)}
          />
          휴면 그룹만 ({dormantCount})
        </label>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            그룹 {visibleGroups.length}개
            {isLoading && " (불러오는 중...)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-12 gap-2 border-b bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
            <div className="col-span-5">그룹</div>
            <div className="col-span-2 text-center">멤버</div>
            <div className="col-span-2 text-center">기도카드</div>
            <div className="col-span-3 text-center">상태</div>
          </div>
          <div className="max-h-[32rem] divide-y overflow-y-auto">
            {!isLoading && visibleGroups.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                조건에 맞는 그룹이 없어요
              </div>
            )}
            {visibleGroups.map((group) => (
              <div
                key={group.id}
                className="grid grid-cols-12 items-center gap-2 px-4 py-2.5"
              >
                <div className="col-span-5 min-w-0">
                  <div className="truncate text-sm font-medium">
                    {group.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {group.createdAt.slice(0, 10)} 개설
                  </div>
                </div>
                <div className="col-span-2 text-center text-sm">
                  {group.memberCount}
                </div>
                <div className="col-span-2 text-center text-sm">
                  {group.prayCardCount}
                </div>
                <div className="col-span-3 text-center">
                  <Badge
                    className={group.isDormant ? "bg-gray-400" : "bg-blue-500"}
                  >
                    {group.isDormant ? "휴면" : "활동"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-gray-400">
        휴면 = 최근 14일간 기도카드 작성 0건
      </p>
    </div>
  );
};

export default GroupsTab;
