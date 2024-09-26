import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useBaseStore from "@/stores/baseStore";

const GroupRedirectPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const groupList = useBaseStore((state) => state.groupList);
  const fetchGroupListByUserId = useBaseStore(
    (state) => state.fetchGroupListByUserId
  );

  useEffect(() => {
    if (user) fetchGroupListByUserId(user.id);
  }, [fetchGroupListByUserId, user]);

  useEffect(() => {
    if (groupList) {
      if (groupList.length === 0) {
        navigate("/group/new", { replace: true });
      } else {
        navigate(`/group/${groupList[0].id}`, { replace: true });
      }
    }
  }, [fetchGroupListByUserId, groupList, navigate, user]);

  return null;
};

export default GroupRedirectPage;
