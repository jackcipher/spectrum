"use client";

import WaveSurferPlayer from "@/components/waveform/waveform";
import { Button, Flex, Progress, Slider, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.js";
import Control from "./control";

const Home = () => {
  const bottomTimline = TimelinePlugin.create({
    height: 10,
    timeInterval: 0.1,
    primaryLabelInterval: 10,
    style: {
      fontSize: "10px",
      color: "#6A3274",
    },
  });

  const [loadPercent, setLoadPercent] = useState(0);
  const [playBtnText, setPlayBtnText] = useState("Play");
  const [loaded, setLoaded] = useState(false);
  const [ws, setWavesurfer] = useState<WaveSurfer>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {}, [containerRef]);

  return (
    <>
      <Control
        onPlayPauseClick={() => {
          ws!.playPause();
        }}
        onZoomChange={(v) => {
          ws?.zoom(v);
        }}
      ></Control>

      <Spin spinning={!loaded}>
        <Flex vertical>
          <Flex>
            <Progress percent={loadPercent} />
          </Flex>
          <Flex align="center" gap="middle">
            Zoom:
            <Slider
              style={{ width: 200 }}
              min={10}
              max={200}
              onChange={(v) => {
                ws?.zoom(v);
              }}
              defaultValue={50}
            />
          </Flex>

          <Flex align="center" gap="middle">
            Play Control:
            <Button
              onClick={() => {
                ws!.setTime(ws!.getCurrentTime() - 3);
              }}
            >
              Backward 3s
            </Button>
            <Button
              onClick={() => {
                ws!.setTime(ws!.getCurrentTime() + 5);
              }}
            >
              Forward 5s
            </Button>
            <Button
              onClick={() => {
                ws!.playPause();
                if (ws!.isPlaying()) {
                  setPlayBtnText("Pause");
                } else {
                  setPlayBtnText("Play");
                }
              }}
            >
              {playBtnText}
            </Button>
          </Flex>
        </Flex>
      </Spin>

      <Spin spinning={!loaded}>
        <WaveSurferPlayer
          setWavesurfer={(v) => {
            setWavesurfer(v);
            setLoaded(true);
          }}
          url="/demo.mp3"
          height={100}
          waveColor="#C4C4C4"
          progressColor="#FE6E00"
          autoScroll={true}
          autoCenter={true}
          hideScrollbar={true}
          dragToSeek={true}
          minPxPerSec={50}
          plugins={[bottomTimline]}
        />
      </Spin>
    </>
  );
};

export default Home;
