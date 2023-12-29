"use client";

import WaveSurferPlayer from "@/components/waveform/waveform";
import { Spin } from "antd";
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
  const [loopA, setLoopA] = useState(0);
  const [loopB, setLoopB] = useState(0);
  const [wsRegion, setWsRegion] = useState<RegionsPlugin>();
  const [ws, setWavesurfer] = useState<WaveSurfer>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {}, [containerRef]);

  const setActiveLoopRegion = () => {
    if (!wsRegion || !ws) return;
    const duration = ws.getDuration();
    const currentTime = ws.getCurrentTime();
    const regions = wsRegion.getRegions().sort((a, b) => a.end - b.end);
    if (regions.length === 0) {
      setLoopA(0);
      setLoopB(ws.getDuration());
    }
    regions.forEach((x, i) => {
      if (i === 0 && currentTime < x.start) {
        setLoopA(0);
        setLoopB(x.start);
      } else if (i === regions.length - 1) {
        setLoopA(x.start);
        setLoopB(duration);
      } else if (currentTime >= x.start && currentTime < regions[i + 1].start) {
        setLoopA(x.start);
        setLoopB(regions[i + 1].start);
      }
    });
  };

  const onAudioProcess = (currentTime: number) => {
    if (!ws) return;
    if (currentTime >= loopB) {
      ws.setTime(loopA);
      setActiveLoopRegion();
    }
  };

  const onABPlayClick = () => {
    if (!wsRegion || !ws) return;
    const currentTime = ws.getCurrentTime();

    if (
      Math.abs(currentTime) < 0.1 ||
      Math.abs(currentTime - ws.getDuration()) < 1
    ) {
      return;
    }

    let regions = wsRegion.getRegions().sort((a, b) => a.end - b.end);
    let removeFlag = false;
    regions.forEach((x, i) => {
      if (Math.abs(x.start - currentTime) < 0.1) {
        regions[i].remove();
        removeFlag = true;
        return;
      }
    });
    if (removeFlag) return;
    wsRegion.addRegion({
      start: currentTime,
      color: "black",
    });
    console.log(regions, regions.length);
    if (regions.length <= 1) {
      ws.setTime(0);
    } else {
      ws.setTime(regions[regions.length - 2].end);
    }
    setActiveLoopRegion();
  };

  return (
    <>
      <p>loopA {loopA}</p>
      <p>loopB {loopB}</p>
      <Spin spinning={!loaded}>
        <WaveSurferPlayer
          setRegion={(r) => {
            setWsRegion(r);
          }}
          setWavesurfer={(wavesurfer) => {
            setWavesurfer(wavesurfer);
            setLoaded(true);
          }}
          onAudioProcess={onAudioProcess}
          url="/demo.mp3"
          height={100}
          waveColor="#C4C4C4"
          progressColor="#FE6E00"
          autoCenter={true}
          autoScroll={true}
          dragToSeek={true}
          hideScrollbar={true}
          minPxPerSec={50}
          plugins={[bottomTimline]}
        />
      </Spin>

      <Spin spinning={!loaded}>
        <Control
          onPlayPauseClick={() => {
            if (!ws) return;
            ws.playPause();
          }}
          onForwardBackwardClick={(offset) => {
            if (!ws) return;
            ws.setTime(ws.getCurrentTime() + offset);
          }}
          onLoopSetClick={onABPlayClick}
          onNextLoopClick={() => {
            if (!wsRegion || !ws) return;
            const regions = wsRegion.getRegions();
            const current = ws.getCurrentTime();
            if (regions.length === 0) {
              return;
            }

            regions
              .sort((a, b) => a.end - b.end)
              .forEach((x, i) => {
                if (x.start > current) {
                  ws.setTime(x.start);
                }
              });
          }}
          onPrevLoopClick={() => {}}
        ></Control>
      </Spin>
    </>
  );
};

export default Home;
