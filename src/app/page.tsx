"use client";
import { Button, Layout } from "antd";
import { useState } from "react";
const { Header, Sider, Content } = Layout;

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  return <Button>Jump to audio</Button>;
}
