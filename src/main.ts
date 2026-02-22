import './style.css'

import { captureDisplay, captureAudio, mixStreams } from './stream';
import { Recorder } from './recorder';
import { logger } from './logger';

// UI 要素を生成
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <header>
    <h1>web-stream-captor プロトタイプ</h1>
  </header>
  <main>
    <section>
      <button id="btn-capture" type="button">画面共有</button>
      <button id="btn-start" type="button" disabled>録画開始</button>
      <button id="btn-stop" type="button" disabled>停止</button>
    </section>
    <section>
      <video id="preview" autoplay muted playsinline style="max-width:100%;"></video>
    </section>
    <section id="downloads"></section>
  </main>
`;

const btnCapture = document.getElementById('btn-capture') as HTMLButtonElement;
const btnStart = document.getElementById('btn-start') as HTMLButtonElement;
const btnStop = document.getElementById('btn-stop') as HTMLButtonElement;
const preview = document.getElementById('preview') as HTMLVideoElement;
const downloads = document.getElementById('downloads') as HTMLDivElement;

let currentStream: MediaStream | null = null;
let currentRecorder: Recorder | null = null;

btnCapture.addEventListener('click', async () => {
  logger.info('click capture button');
  try {
    const display = await captureDisplay();
    // マイク音声も取得して合成
    let mic: MediaStream | null = null;
    try {
      mic = await captureAudio();
    } catch (err) {
      logger.error('could not get microphone', { error: err });
      alert('マイク音声を取得できませんでした。画面共有のみ録画されます。');
    }

    if (mic) {
      currentStream = mixStreams([display, mic]);
      // 後で解放するために元のストリームも保持
      // (ミックス結果には元トラックは含まれない場合があるため)
      (currentStream as any)._orig = [display, mic];
    } else {
      currentStream = display;
      (currentStream as any)._orig = [display];
    }

    logger.info('currentStream tracks', {
      video: currentStream.getVideoTracks().length,
      audio: currentStream.getAudioTracks().length,
    });

    preview.srcObject = currentStream;
    // プレビューは録画中にフィードバック音が出ないよう muted
    preview.muted = true;

    btnStart.disabled = false;
    btnCapture.disabled = true;
  } catch (err) {
    logger.error('capture failed', { error: err });
    // エラーが発生した場合はボタン状態をリセットして再試行できるようにする
    btnCapture.disabled = false;
    btnStart.disabled = true;
  }
});

btnStart.addEventListener('click', () => {
  if (!currentStream) return;
  logger.info('click start button');
  // 今はストリームそのまま渡す
  recorder = new Recorder(currentStream);
  recorder.start();
  btnStart.disabled = true;
  btnStop.disabled = false;
});

btnStop.addEventListener('click', async () => {
  if (!recorder) return;
  logger.info('click stop button');
  const blob = await recorder.stop();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `capture-${Date.now()}.webm`;
  a.textContent = 'ダウンロード';
  downloads.appendChild(a);

  // ページ上で再生できるビデオも追加して音声を確認
  try {
    const blob = await recorder.stop();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capture-${Date.now()}.webm`;
    a.textContent = 'ダウンロード';
    downloads.appendChild(a);

    // ページ上で再生できるビデオも追加して音声を確認
    const player = document.createElement('video');
    player.controls = true;
    player.src = url;
    player.style.display = 'block';
    player.style.maxWidth = '100%';
    downloads.appendChild(player);
  } catch (error) {
    console.error('Failed to stop recorder', error);
  } finally {
    // ストリームを解放
    // 元のストリームも停止
    const orig = (currentStream as any)?._orig as MediaStream[] | undefined;
    if (orig) {
      orig.forEach((s) => s.getTracks().forEach((t) => t.stop()));
    } else {
      currentStream?.getTracks().forEach((t) => t.stop());
    }
    preview.srcObject = null;
    btnStop.disabled = true;
    btnCapture.disabled = false;
  }
});
