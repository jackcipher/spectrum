"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer, { WaveSurferOptions } from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
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
  setRegion?(region: RegionsPlugin): void;
  setLoadingProgress?(percent: number): void;
  onAudioProcess?(currentTime: number): void;
}

const WaveSurferPlayer = (props: WaveSurferPlayerOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
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
          innerContainer.style.transform = `translateX(${
            innerContainer.clientWidth / 2 - xScroll
          }px)`;
        }
        // 结束部分
        else if (
          innerContainer.clientWidth / 2 + xScroll >
          wrapper.scrollWidth
        ) {
          innerContainer.style.transform = `translateX(${
            wrapper.scrollWidth - xScroll - innerContainer.clientWidth / 2
          }px)`;
        } else {
          innerContainer.style.transform = `unset;`;
          innerContainer.scrollLeft = xScroll - innerContainer.clientWidth / 2;
        }
      }
    }
  };

  useEffect(() => {
    if (!wavesurfer) return;

    const subscriptions = [
      wavesurfer.on("ready", () => {
        if (!wavesurfer) return;

        if (props.setWavesurfer) {
          props.setWavesurfer(wavesurfer);
          fixPosition(true);
        }

        if (props.setRegion) {
          let flag = false;
          wavesurfer.getActivePlugins().forEach((x) => {
            if ("regions" in x) {
              const wsRegion = x as unknown as RegionsPlugin;
              props.setRegion!(wsRegion);
              flag = true;
              return;
            }
          });
          if (!flag) {
            const wsRegion = RegionsPlugin.create();
            wavesurfer.registerPlugin(wsRegion);
            props.setRegion(wsRegion);
          }
        }

        console.log(wavesurfer.getWrapper().parentNode?.parentNode);
      }),
      wavesurfer.on("loading", (percent) => {
        if (props.setLoadingProgress) {
          props.setLoadingProgress(percent);
        }
      }),

      wavesurfer.on("audioprocess", () => {
        fixPosition();
        if (props.onAudioProcess && wavesurfer)
          props.onAudioProcess(wavesurfer.getCurrentTime());
      }),
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
          overflowX: "hidden",
        }}
      />
    </>
  );
};

export default WaveSurferPlayer;
