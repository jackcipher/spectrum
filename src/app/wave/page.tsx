"use client";

import WaveSurferPlayer from "@/components/waveform/waveform";
import { Button, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
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

  const [loaded, setLoaded] = useState(false);
  const [ws, setWavesurfer] = useState<WaveSurfer>();
  // const [wsRegion, setWsRegion] = useState<RegionsPlugin>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {}, [containerRef]);

  return (
    <>
      <Spin spinning={!loaded}>
        <WaveSurferPlayer
          setWavesurfer={(wavesurfer) => {
            setWavesurfer(wavesurfer);
            // setWsRegion(wavesurfer.registerPlugin(RegionsPlugin.create()));
            setLoaded(true);
          }}
          url="/demo.mp3"
          height={100}
          waveColor="#C4C4C4"
          progressColor="#FE6E00"
          autoCenter={true}
          hideScrollbar={true}
          minPxPerSec={50}
          plugins={[bottomTimline, RegionsPlugin.create()]}
        />
      </Spin>

      <Spin spinning={!loaded}>
        <Control
          onPlayPauseClick={() => {
            ws!.playPause();
          }}
          onForwardBackwardClick={(offset) => {
            ws!.setTime(ws!.getCurrentTime() + offset);
          }}
          onLoopSetClick={() => {}}
          onNextLoopClick={() => {}}
          onPrevLoopClick={() => {}}
        ></Control>
      </Spin>
      <Button
        onClick={() => {
          ws!.getActivePlugins().forEach((v) => {
            if ("regions" in v) {
              //@ts-nocheck
              const wsRegion: RegionsPlugin = v;
              wsRegion.addRegion({ start: 5 });
              wsRegion.addRegion({ start: 15 });
              wsRegion.addRegion({ start: 10 });
              wsRegion.addRegion({ start: 30 });
              wsRegion.addRegion({ start: 20.123432131231231 });
              wsRegion.addRegion({ start: 2 });
            }
          });
        }}
      >
        add region
      </Button>
      <Button
        onClick={() => {
          ws!.getActivePlugins().forEach((v) => {
            if ("regions" in v) {
              //@ts-nocheck
              const wsRegion: RegionsPlugin = v;
              const regions = wsRegion
                .getRegions()
                .sort((a, b) => a.end - b.end);
              console.log(regions);
              regions.forEach((x) => {
                console.log(x.end);
              });
            }
          });
        }}
      >
        show regions
      </Button>
    </>
  );
};

export default Home;
