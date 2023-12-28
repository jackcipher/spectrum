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

  const fixPosition = (force = false) => {
    if (!wavesurfer) return;
    const duration = wavesurfer.getDuration();
        if ((wavesurfer.isPlaying() || force) && containerRef.current) {
          const currentTime = wavesurfer.getCurrentTime();
          const progress = currentTime / duration;
          const wrapper = wavesurfer.getWrapper();
          const xScroll = wrapper.scrollWidth * progress;
          const innerContainer = wrapper.parentElement as HTMLElement;
          // 将进度条强制居中
          if (innerContainer) {
            // 最开始部分
            if (innerContainer.clientWidth / 2 > xScroll) {
              innerContainer.style.transform = `translateX(${innerContainer.clientWidth / 2 - xScroll}px)`;
            }
            // 结束部分
            else if (innerContainer.clientWidth / 2 + xScroll > wrapper.scrollWidth) {
              innerContainer.style.transform = `translateX(${wrapper.scrollWidth - xScroll - innerContainer.clientWidth / 2}px)`;
            }
            else {
              innerContainer.style.transform = `unset;`;
              innerContainer.scrollLeft = xScroll - innerContainer.clientWidth / 2;
            }
          }
        }
  }

  useEffect(() => {
    if (!wavesurfer) return;

    setCurrentTime(0);
    setIsPlaying(false);

    const subscriptions = [
      wavesurfer.on("ready", () => {
        if (props.setWavesurfer) {
          props.setWavesurfer(wavesurfer!);
          fixPosition(true);
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

      wavesurfer.on("audioprocess", () => {
        fixPosition();
      })
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
          overflowX: "hidden"
        }}
      />
    </>
  );
};

export default WaveSurferPlayer;
