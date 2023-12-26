"use client";

import WaveSurferPlayer from "@/components/waveform/waveform";
import { Button, Flex, Skeleton, Slider } from "antd";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const Home = () => {
  const [playBtnText, setPlayBtnText] = useState("Play");
  const [loaded, setLoaded] = useState(false);
  const [ws, setWavesurfer] = useState<WaveSurfer>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {}, [containerRef]);

  return (
    <>
      {!loaded && <Skeleton />}
      <Flex vertical className={loaded ? "" : "hide"}>
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

      <div className={loaded ? "" : "hide"}>
        <WaveSurferPlayer
          setWavesurfer={(v) => {
            setWavesurfer(v);
            setLoaded(true);
          }}
          url="/demo.mp3"
          height={100}
          waveColor="#C4C4C4"
          progressColor="#FE6E00"
          autoCenter={true}
          hideScrollbar={true}
          minPxPerSec={50}
        />
      </div>
    </>
  );
};

export default Home;
