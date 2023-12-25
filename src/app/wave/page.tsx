"use client";

import WaveSurferPlayer from "@/components/waveform/waveform";

const Home = () => {
  return (
    <>
      <WaveSurferPlayer
        url="/demo.mp3"
        height={100}
        waveColor="rgb(200, 0, 200)"
        progressColor="rgb(100, 0, 100)"
        container={""}
        minPxPerSec={50}
      />
    </>
  );
};

export default Home;
