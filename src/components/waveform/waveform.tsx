"use client";

import IndicatorPlugin from "@/app/wave/plugins/indicator";
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

interface WaveSurferPlayerOptions
  extends Omit<WaveSurferOptions, "container" | "plugins"> {
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

    const indicator = IndicatorPlugin.create({});

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

    const plugins = [
      topTimeline,
      bottomTimline,
      RegionsPlugin.create(),
      indicator,
    ];
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
          }
        }),
        wavesurfer.on("loading", (percent) => {}),
        wavesurfer.on("audioprocess", () => {
          const ct = wavesurfer.getCurrentTime();
          if (state.enableLoop && state.loopEnd > 0 && ct > state.loopEnd) {
            wavesurfer.setTime(state.loopStart);
          }
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
