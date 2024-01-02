"use client";

import WaveSurferPlayer, {
  WaveSurferPlayerRef,
} from "@/components/waveform/waveform";
import { Flex, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.js";
import Control from "./control";

const Home = () => {
  const waveRef = useRef<WaveSurferPlayerRef>(null);
  const bottomTimline = TimelinePlugin.create({
    height: 10,
    timeInterval: 0.1,
    primaryLabelInterval: 10,
    style: {
      fontSize: "10px",
      color: "#6A3274",
    },
  });

  const [loaded, setLoaded] = useState(false);
  const [audioURL, setAudioURL] = useState("/demo.mp3");

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {}, [containerRef]);

  return (
    <>
      <Spin spinning={!loaded}>
        <WaveSurferPlayer
          onLoaded={() => {
            setLoaded(true);
          }}
          ref={waveRef}
          url={audioURL}
          height={80}
          waveColor="#C4C4C4"
          progressColor="#FE6E00"
          autoCenter={true}
          autoScroll={true}
          dragToSeek={true}
          hideScrollbar={false}
          minPxPerSec={50}
          plugins={[bottomTimline]}
        />
      </Spin>
      <Spin spinning={!loaded}>
        <Flex justify="center">
          <Control
            onPlayPauseClick={() => {
              waveRef.current?.playPause();
            }}
            onForwardBackwardClick={(offset) => {
              waveRef.current?.forward(offset);
            }}
            onLoopSetClick={() => waveRef.current?.setLoopPoint()}
            onNextLoopClick={() => {
              waveRef.current?.nextLoop();
            }}
            onPrevLoopClick={() => {
              waveRef.current?.prevLoop();
            }}
          ></Control>
        </Flex>
      </Spin>
    </>
  );
};

export default Home;
