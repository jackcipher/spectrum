"use client";

import {
  Ref,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
  useState,
} from "react";
import WaveSurfer, { WaveSurferOptions } from "wavesurfer.js";
import { GenericPlugin } from "wavesurfer.js/dist/base-plugin.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.js";
import "./waveform.css";

const useWavesurfer = (
  containerRef: React.RefObject<HTMLDivElement>,
  plugins: GenericPlugin[],
  options: WaveSurferPlayerOptions
) => {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer>();
  useEffect(() => {
    if (!containerRef.current) return;
    const ws = WaveSurfer.create({
      ...options,
      plugins: plugins,
      container: containerRef.current,
    });
    setWavesurfer(ws);
    return () => {
      ws.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  useEffect(() => {
    wavesurfer?.zoom(options.minPxPerSec!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.minPxPerSec]);
  return wavesurfer;
};

interface WaveSurferPlayerOptions extends Omit<WaveSurferOptions, "container"> {
  onLoaded?(ws: WaveSurfer): void;
}

export interface WaveSurferPlayerRef {
  playPause(): void;
  forward(seconds: number): void;
  setLoopPoint(): void;
  prevLoop(): void;
  nextLoop(): void;
}

interface PlayerState {
  enableLoop: boolean;
  loopStart: number;
  loopEnd: number;
  duration: number;
}

interface PlayerActionPayload {
  loopStart?: number;
  loopEnd?: number;
  enableLoop?: boolean;
}

interface PlayerAction {
  type: PlayerActionType;
  payload: PlayerActionPayload;
}

enum PlayerActionType {
  PlayerReady,
  PlayerSetLoopRegion,
  PlayerStopLoop,
}

const WaveSurferPlayer = forwardRef(
  (props: WaveSurferPlayerOptions, ref: Ref<WaveSurferPlayerRef>) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [wsRegion, setWsRegion] = useState<RegionsPlugin>();

    const topTimeline = TimelinePlugin.create({
      height: 10,
      insertPosition: "beforebegin",
      timeInterval: 0.2,
      primaryLabelInterval: 5,
      secondaryLabelInterval: 1,
      style: {
        fontSize: "10px",
        color: "#2D5B88",
      },
    });

    const bottomTimline = TimelinePlugin.create({
      height: 10,
      timeInterval: 0.5,
      primaryLabelInterval: 10,
      style: {
        fontSize: "10px",
        color: "#6A3274",
      },
    });

    useImperativeHandle(ref, () => ({
      forward(seconds: number) {
        if (!wavesurfer) return;
        wavesurfer.setTime(wavesurfer.getCurrentTime() + seconds);
      },
      playPause() {
        if (!wavesurfer) return;
        wavesurfer.playPause();
      },
      setLoopPoint() {
        if (!wavesurfer || !wsRegion) return;
        const t = wavesurfer.getCurrentTime();
        const regions = wsRegion.getRegions().sort((a, b) => a.start - b.start);
        let flag = false;
        regions.forEach((x, i) => {
          if (Math.abs(x.start - t) < 0.1) {
            regions[i].remove();
            flag = true;
          }
        });
        if (flag) {
          dispatch({ type: PlayerActionType.PlayerStopLoop, payload: {} });
          return;
        }

        if (regions.length === 2) {
          wsRegion.clearRegions();
        }

        wsRegion.addRegion({
          start: t,
          color: "#FE6E00",
        });

        if (wsRegion.getRegions().length === 2) {
          const regions = wsRegion
            .getRegions()
            .sort((a, b) => a.start - b.start);
          dispatch({
            type: PlayerActionType.PlayerSetLoopRegion,
            payload: {
              loopStart: regions[0].start,
              loopEnd: regions[1].start,
              enableLoop: true,
            },
          });
        } else {
          dispatch({ type: PlayerActionType.PlayerStopLoop, payload: {} });
        }
      },
      prevLoop() {
        if (!wsRegion || !wavesurfer) return;
        const regions = wsRegion.getRegions().sort((a, b) => a.start - b.start);
        const ct = wavesurfer.getCurrentTime();
        if (regions.length === 0) {
          wavesurfer.setTime(0);
          return;
        }
        regions.forEach((x, i) => {
          if (ct < x.start && i === 0) {
            wavesurfer.setTime(0);
            return;
          } else if (ct > x.start) {
            wavesurfer.setTime(x.start);
            return;
          }
        });
      },
      nextLoop() {},
    }));

    const plugins = [topTimeline, bottomTimline, RegionsPlugin.create()];
    const wavesurfer = useWavesurfer(containerRef, plugins, props);

    const reducer = (state: PlayerState, action: PlayerAction): PlayerState => {
      if (!wavesurfer) return state;
      switch (action.type) {
        case PlayerActionType.PlayerReady: {
          return {
            ...state,
            loopStart: 0,
            loopEnd: wavesurfer.getDuration(),
            duration: wavesurfer.getDuration(),
          };
        }
        case PlayerActionType.PlayerSetLoopRegion: {
          return {
            ...state,
            loopStart: action.payload.loopStart!,
            loopEnd: action.payload.loopEnd!,
            enableLoop: action.payload.enableLoop!,
          };
        }
        case PlayerActionType.PlayerStopLoop: {
          return {
            ...state,
            enableLoop: false,
          };
        }
        default:
          return state;
      }
    };
    const [state, dispatch] = useReducer(reducer, {
      enableLoop: false,
      loopStart: 0,
      loopEnd: 0,
      duration: 0,
    });

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
            innerContainer.scrollLeft =
              xScroll - innerContainer.clientWidth / 2;
          }
        }
      }
    };

    useEffect(() => {
      if (!wavesurfer) return;
      const subscriptions = [
        wavesurfer.on("ready", () => {
          if (!wavesurfer) return;
          dispatch({ type: PlayerActionType.PlayerReady, payload: {} });
          wavesurfer.getActivePlugins().forEach((x) => {
            if ("regions" in x) {
              setWsRegion(x as unknown as RegionsPlugin);
            }
          });
          if (props.onLoaded) {
            props.onLoaded(wavesurfer);
            fixPosition(true);
          }
        }),
        wavesurfer.on("loading", (percent) => {}),
        wavesurfer.on("audioprocess", () => {
          const ct = wavesurfer.getCurrentTime();
          if (state.enableLoop && state.loopEnd > 0 && ct > state.loopEnd) {
            wavesurfer.setTime(state.loopStart);
          }
          fixPosition();
        }),
      ];
      return () => {
        subscriptions.forEach((unsub) => unsub());
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wavesurfer, state]);

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
  }
);
WaveSurferPlayer.displayName = "WaveSurferPlayer";

export default WaveSurferPlayer;
