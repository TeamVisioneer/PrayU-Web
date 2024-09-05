import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import { useEffect, useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { Skeleton } from "@/components/ui/skeleton";

const MyProfilePage = () => {
  const { user } = useAuth();

  const fetchProfilesByUserId = useBaseStore(
    (state) => state.fetchProfilesByUserId
  );
  const profile = useBaseStore((state) => state.profile);

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const updateProfileName = useBaseStore((state) => state.updateProfileName);

  const onBlutUpdateName = () => {
    if (name.trim() === "") setName(profile?.full_name || "");
    else updateProfileName(user!.id, name);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        setLoading(true);
        await fetchProfilesByUserId(user.id);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, fetchProfilesByUserId]);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name!);
    }
  }, [profile]);

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="w-full flex justify-between items-center">
        <div className="w-[28px]">
          <IoChevronBack size={20} onClick={() => window.history.back()} />
        </div>

        <span className="text-xl font-bold">나의 정보</span>
        <p className="w-[28px]"></p>
      </div>
      <div className="flex justify-center h-[80px] w-max">
        {loading ? (
          <Skeleton className="h-[80px] w-[80px] rounded-full bg-gray-300" />
        ) : (
          <img
            className="h-full object-cover rounded-full"
            src={profile?.avatar_url || "/images/defaultProfileImage.png"}
          />
        )}
      </div>
      <div className="flex flex-col items-center gap-4 w-full ">
        {loading ? (
          <Skeleton className="w-full h-[55px] flex items-center gap-4 p-4 bg-gray-300 rounded-xl" />
        ) : (
          <div className="w-full h-[55px] flex items-center gap-4 p-4 bg-white rounded-xl">
            <span className="text-md font-bold">이름</span>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => onBlutUpdateName()}
              placeholder="이름을 입력해주세요!"
              maxLength={12}
              className="text-md flex-1 border-none text-right"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfilePage;
