"use client";
import { HomeOutlined, SoundOutlined } from "@ant-design/icons";
import { Layout, Menu, Skeleton } from "antd";

import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import "./globals.css";
import "./layout.css";

const { Header, Sider, Content } = Layout;
const items = [
  {
    key: "/",
    icon: <HomeOutlined />,
    label: "Home",
  },
  {
    key: "/wave",
    icon: <SoundOutlined />,
    label: "Wave",
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setLoaded(true);
  });

  return (
    <html className={loaded ? "" : "hide"}>
      <body>
        {!loaded && <Skeleton active />}
        <Layout className="main-layout">
          <Sider trigger={null} collapsible collapsed={collapsed}>
            <Menu
              theme="dark"
              onClick={(e) => {
                router.push(e.key);
                console.log(e);
              }}
              defaultSelectedKeys={["1"]}
              items={items}
            />
          </Sider>
          <Layout className="site-layout">
            <Content
              className="site-layout-background"
              style={{
                margin: "24px 0",
                padding: 0,
              }}
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      </body>
    </html>
  );
}
