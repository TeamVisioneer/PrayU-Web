import React from "react";
import useAuth from "../hooks/useAuth";

const GroupPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Group Page</h1>
      <h2>{user?.id}</h2>
    </div>
  );
};

export default GroupPage;
