"use client";
import { Button } from "antd";
import { useState } from "react";

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Button
      onClick={() => {
        console.log("click");
        window.location.href = "/wave";
      }}
    >
      Jump to Wave
    </Button>
  );
}
