"use client";

import { throttle } from "@/tools/limit";
import { Button, Progress } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
// Import WaveSurfer
import WaveSurfer, { WaveSurferOptions } from "wavesurfer.js";

// WaveSurfer hook
const useWavesurfer = (
  containerRef: React.RefObject<HTMLDivElement>,
  options: WaveSurferOptions
) => {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer>();

  // Initialize wavesurfer when the container mounts
  // or any of the props change
  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      ...options,
      container: containerRef.current,
    });

    setWavesurfer(ws);

    return () => {
      ws.destroy();
    };
  }, [options, containerRef]);

  return wavesurfer;
};

// Create a React component that will render wavesurfer.
// Props are wavesurfer options.
const WaveSurferPlayer = (props: WaveSurferOptions) => {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const wavesurfer = useWavesurfer(containerRef, props);

  // On play button click
  const onPlayClick = useCallback(() => {
    wavesurfer?.isPlaying() ? wavesurfer?.pause() : wavesurfer?.play();
  }, [wavesurfer]);

  // Initialize wavesurfer when the container mounts
  // or any of the props change
  useEffect(() => {
    if (!wavesurfer) return;

    setCurrentTime(0);
    setIsPlaying(false);

    const subscriptions = [
      wavesurfer.on("loading", (percent) => {
        setProgress(percent);
        console.log("Loading", percent + "%");
      }),
      wavesurfer.on("ready", () => {
        document!
          .querySelector(".waveform div")!
          .shadowRoot.querySelector(".scroll")!
          .addEventListener(
            "scroll",
            throttle((e) => {
              console.log(e, e.target);
            }),
            250
          );
      }),
      wavesurfer.on("play", () => setIsPlaying(true)),
      wavesurfer.on("pause", () => setIsPlaying(false)),
      wavesurfer.on("timeupdate", (currentTime) => setCurrentTime(currentTime)),
    ];

    return () => {
      subscriptions.forEach((unsub) => unsub());
    };
  }, [wavesurfer]);

  return (
    <>
      <Progress percent={progress} />
      <div
        className="waveform"
        ref={containerRef}
        style={{ minHeight: "120px" }}
      />

      <Button onClick={onPlayClick} style={{ marginTop: "1em" }}>
        {isPlaying ? "Pause" : "Play"}
      </Button>

      <p>当前播放: {currentTime}</p>
    </>
  );
};

export default WaveSurferPlayer;
