/**
 * The Hover plugin follows the mouse and shows a timestamp
 */

import BasePlugin, {
  type BasePluginEvents,
} from "wavesurfer.js/dist/base-plugin.js";

import render from "wavesurfer.js/dist/dom.js";

export type IndicatorPluginOptions = {
  style?: Partial<CSSStyleDeclaration> | string;
};

const defaultOptions = {
  height: 20,
  formatTimeCallback: (seconds: number) => {
    if (seconds / 60 > 1) {
      // calculate minutes and seconds from seconds count
      const minutes = Math.floor(seconds / 60);
      seconds = Math.round(seconds % 60);
      const paddedSeconds = `${seconds < 10 ? "0" : ""}${seconds}`;
      return `${minutes}:${paddedSeconds}`;
    }
    const rounded = Math.round(seconds * 1000) / 1000;
    return `${rounded}`;
  },
};

export type IndicatorPluginEvents = BasePluginEvents & {
  ready: [];
};

class IndicatorPlugin extends BasePlugin<
  IndicatorPluginEvents,
  IndicatorPluginOptions
> {
  private indicatorWrapper: HTMLElement;
  protected options: IndicatorPluginOptions & typeof defaultOptions;

  constructor(options?: IndicatorPluginOptions) {
    super(options || {});

    this.options = Object.assign({}, defaultOptions, options);
    this.indicatorWrapper = this.initindicatorWrapper();
  }

  public static create(options?: IndicatorPluginOptions) {
    return new IndicatorPlugin(options);
  }

  fixPosition = (force = false) => {
    if (!this.wavesurfer) return;
    const duration = this.wavesurfer.getDuration();
    if (this.wavesurfer.isPlaying() || force) {
      const currentTime = this.wavesurfer.getCurrentTime();
      const progress = currentTime / duration;
      const wrapper = this.wavesurfer.getWrapper();
      const xScroll = wrapper.scrollWidth * progress;
      const innerContainer = wrapper.parentElement as HTMLElement;
      if (innerContainer) {
        if (innerContainer.clientWidth / 2 > xScroll) {
          innerContainer.style.transform = `translateX(${
            innerContainer.clientWidth / 2 - xScroll
          }px)`;
        } else if (
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

  /** Called by wavesurfer, don't call manually */
  onInit() {
    if (!this.wavesurfer) {
      throw Error("WaveSurfer is not initialized");
    }

    let container = this.wavesurfer.getWrapper();

    container.appendChild(this.indicatorWrapper);

    this.subscriptions.push(
      this.wavesurfer.on("redraw", () => this.initIndicator()),
      this.wavesurfer.on("ready", () => {
        this.fixPosition(true);
      }),
      this.wavesurfer.on("audioprocess", () => {
        this.fixPosition(true);
      })
    );
    if (this.wavesurfer.getDuration()) {
      this.initIndicator();
    }
  }

  /** Unmount */
  public destroy() {
    this.indicatorWrapper.remove();
    super.destroy();
  }

  private initindicatorWrapper(): HTMLElement {
    return render("div", {
      part: "indicator-wrapper",
      style: { pointerEvents: "none" },
    });
  }

  private initIndicator() {
    const isTop = true;

    const indicator = render("div", {
      style: {
        height: `200%`,
        overflow: "hidden",
        fontSize: `${this.options.height / 2}px`,
        whiteSpace: "nowrap",
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        zIndex: "2",
      },
    });

    if (typeof this.options.style === "string") {
      indicator.setAttribute(
        "style",
        indicator.getAttribute("style") + this.options.style
      );
    } else if (typeof this.options.style === "object") {
      Object.assign(indicator.style, this.options.style);
    }

    const notchEl = render("div", {
      style: {
        width: "0",
        height: "50%",
        display: "flex",
        flexDirection: "column",
        justifyContent: isTop ? "flex-start" : "flex-end",
        top: "0",
        bottom: isTop ? "auto" : "0",
        overflow: "visible",
        borderLeft: "1px solid currentColor",
        position: "absolute",
        zIndex: "1",
      },
    });

    notchEl.style.left = "32px";
    indicator.appendChild(notchEl);

    this.indicatorWrapper.innerHTML = "";
    this.indicatorWrapper.appendChild(indicator);

    this.emit("ready");
  }
}

export default IndicatorPlugin;
