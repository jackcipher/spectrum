import dynamic from 'next/dynamic';

// 动态导入 Wave 组件，关闭 SSR
const WaveDynamic = dynamic(() => import('./wave'), { ssr: false });

export default function Page() {
  return <WaveDynamic />;
}
