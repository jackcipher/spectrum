import { PauseCircleOutlined, PlayCircleFilled } from "@ant-design/icons";

import { Flex, Slider } from "antd";
import { useState } from "react";
import styles from "./control.module.scss";
import ABPlayIcon from "./svg/ab.svg";

interface ControlProp {
  onZoomChange(v: number): void;
  onPlayPauseClick(): void;
}

const primaryBtnClass = styles.btn + " " + styles.primary;

const Control = (prop: ControlProp) => {
  const onPlayPauseClick = () => {
    setIsPlaying(!isPlaying);
    prop.onPlayPauseClick();
  };
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <>
      <Flex className={styles.wrapper} vertical align="center">
        <Flex gap="small">
          {/* <PlayCircleFilled className={styles.btn} /> */}
          {!isPlaying && (
            <PlayCircleFilled
              className={primaryBtnClass}
              onClick={onPlayPauseClick}
            />
          )}
          {isPlaying && (
            <PauseCircleOutlined
              className={primaryBtnClass}
              onClick={onPlayPauseClick}
            />
          )}

          <ABPlayIcon />
        </Flex>
        <Flex>
          <Slider
            style={{ width: 120 }}
            min={10}
            max={200}
            onChange={(v) => {
              prop.onZoomChange(v);
            }}
            defaultValue={50}
          />
        </Flex>
      </Flex>
    </>
  );
};

export default Control;
