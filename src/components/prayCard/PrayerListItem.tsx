import React from "react";

interface PrayItemProps {
  avatar_url: string;
  full_name: string;
  pray_type: string;
}

const PrayListItem: React.FC<PrayItemProps> = ({
  avatar_url,
  full_name,
  pray_type,
}) => {
  return (
    <div
      style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}
    >
      <img
        src={avatar_url}
        alt={full_name}
        style={{ width: "40px", height: "40px", borderRadius: "50%" }}
      />
      <div style={{ marginLeft: "10px" }}>
        <div>{full_name}</div>
        <div>{pray_type}</div>
      </div>
    </div>
  );
};

export default PrayListItem;
