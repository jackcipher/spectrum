"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer, { WaveSurferOptions } from "wavesurfer.js";
import "./waveform.css";

const useWavesurfer = (
  containerRef: React.RefObject<HTMLDivElement>,
  options: WaveSurferPlayerOptions
) => {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer>();

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
  }, [containerRef]);

  useEffect(() => {
    wavesurfer?.zoom(options.minPxPerSec!);
  }, [options.minPxPerSec]);

  return wavesurfer;
};

interface WaveSurferPlayerOptions extends Omit<WaveSurferOptions, "container"> {
  setWavesurfer?(ws: WaveSurfer): void;
  setLoadingProgress?(percent: number): void;
}

const WaveSurferPlayer = (props: WaveSurferPlayerOptions) => {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const wavesurfer = useWavesurfer(containerRef, props);

  const onPlayClick = useCallback(() => {
    wavesurfer?.isPlaying() ? wavesurfer?.pause() : wavesurfer?.play();
  }, [wavesurfer]);

  useEffect(() => {
    if (!wavesurfer) return;

    setCurrentTime(0);
    setIsPlaying(false);

    const subscriptions = [
      wavesurfer.on("ready", () => {
        if (props.setWavesurfer) {
          props.setWavesurfer(wavesurfer!);
        }
      }),
      wavesurfer.on("loading", (percent) => {
        if (props.setLoadingProgress) {
          props.setLoadingProgress(percent);
        }
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
      <div
        className="waveform"
        ref={containerRef}
        style={{
          background: "white",
          borderRadius: "10px",
          padding: "0rem 1rem",
          margin: "0 auto",
        }}
      />
    </>
  );
};

export default WaveSurferPlayer;
