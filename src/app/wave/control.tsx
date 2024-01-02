import { Flex, Slider } from "antd";
import { useState } from "react";
import styles from "./control.module.scss";
import BackwardIcon from "./svg/backward.svg";
import ForwardIcon from "./svg/forward.svg";
import MarkIcon from "./svg/mark.svg";
import PauseIcon from "./svg/pause.svg";
import PlayIcon from "./svg/play.svg";

interface ControlProp {
  onZoomChange?(v: number): void;
  onPlayPauseClick(): void;
  onForwardBackwardClick(offset: number): void;
  onLoopSetClick(): void;
  onNextLoopClick(): void;
  onPrevLoopClick(): void;
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
        <Flex>
          {/* <div className={styles.btn} onClick={prop.onPrevLoopClick}>
            <PrevLoopIcon />
          </div> */}
          <div className={styles.btn} onClick={prop.onLoopSetClick}>
            <MarkIcon />
          </div>
          {/* <div className={styles.btn} onClick={prop.onNextLoopClick}>
            <NextLoopIcon />
          </div> */}
        </Flex>
        <Flex align="center">
          <div
            className={primaryBtnClass}
            onClick={() => {
              prop.onForwardBackwardClick(-3);
            }}
          >
            <BackwardIcon />
          </div>
          <div className={primaryBtnClass} onClick={onPlayPauseClick}>
            {!isPlaying ? <PlayIcon /> : <PauseIcon />}
          </div>
          <div
            className={primaryBtnClass}
            onClick={() => {
              prop.onForwardBackwardClick(5);
            }}
          >
            <ForwardIcon />
          </div>
        </Flex>
        {prop.onZoomChange && (
          <Flex>
            <Slider
              style={{ width: 120 }}
              min={10}
              max={200}
              onChange={(v) => {
                prop.onZoomChange!(v);
              }}
              defaultValue={50}
            />
          </Flex>
        )}
      </Flex>
    </>
  );
};

export default Control;
