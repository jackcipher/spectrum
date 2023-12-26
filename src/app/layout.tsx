"use client";
import {
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import "./globals.css";
import "./layout.css";

const { Header, Sider, Content } = Layout;
const items = [
  {
    key: "1",
    url: "/",
    icon: <HomeOutlined />,
    label: "Home",
  },
  {
    key: "2",
    url: "/wave",
    icon: <SoundOutlined />,
    label: "Wave",
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  });
  return (
    <html className={loaded ? "" : "hide"}>
      <body>
        {!loaded && <Skeleton active />}
        <Layout className="main-layout">
          <Sider trigger={null} collapsible collapsed={collapsed}>
            <div className="logo" />
            <Menu
              theme="dark"
              onClick={(e) => {
                const { item, key, keyPath, domEvent } = e;
                console.log(item, key, keyPath, domEvent);
              }}
              defaultSelectedKeys={["1"]}
              items={items}
            />
          </Sider>
          <Layout className="site-layout">
            <Header
              className="site-layout-background"
              style={{
                padding: 0,
              }}
            >
              {React.createElement(
                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                {
                  className: "trigger",
                  onClick: () => setCollapsed(!collapsed),
                }
              )}
            </Header>
            <Content
              className="site-layout-background"
              style={{
                margin: "24px 16px",
                padding: 24,
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
