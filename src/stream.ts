/**
 * stream.ts
 * メディアデバイス取得およびミキシング用ヘルパー
 */
import { logger } from './logger';

/**
 * 画面共有とシステム音声を含む MediaStream を取得します。
 * @throws {DOMException} ユーザーが許可を拒否した場合やデバイスが存在しない場合
 * @returns Promise resolving to a MediaStream
 */
export async function captureDisplay(): Promise<MediaStream> {
  logger.info('requesting display media');
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    logger.info('obtained display media', { tracks: stream.getTracks().length });
    return stream;
  } catch (err) {
    logger.error('failed to obtain display media', { error: err });
    throw err;
  }
}

/**
 * マイク音声のみを取得します。
 * @throws {DOMException}
 * @returns Promise resolving to a MediaStream containing only audio
 */
export async function captureAudio(): Promise<MediaStream> {
  logger.info('requesting user audio');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    logger.info('obtained user audio', { tracks: stream.getAudioTracks().length });
    return stream;
  } catch (err) {
    logger.error('failed to obtain user audio', { error: err });
    throw err;
  }
}

/**
 * 複数の MediaStream を受け取り、音声を AudioContext で合成して
 * 1 つの MediaStream を返します。
 *
 * video トラックは最初のストリームから取得し、音声はすべてのストリーム
 * から AudioContext 経由でミキシングします。
 *
 * @param streams - ミキシング対象の MediaStream 配列
 * @returns 合成された MediaStream
 */
export function mixStreams(streams: MediaStream[]): MediaStream {
  if (streams.length === 0) throw new Error('no streams to mix');

  // 複数ストリームを AudioContext でミキシング
  const ctx = new AudioContext({ sampleRate: 48000 });
  const destination = ctx.createMediaStreamDestination();

  streams.forEach((stream, idx) => {
    try {
      const src = ctx.createMediaStreamSource(stream);
      const gainNode = ctx.createGain();
      gainNode.gain.value = 1.0;
      src.connect(gainNode).connect(destination);
      logger.info('connected stream to audio context', { idx, tracks: stream.getAudioTracks().length });
    } catch (err) {
      logger.error('failed to process stream in audio context', { idx, error: err });
    }
  });

  const mixed = new MediaStream();
  streams[0].getVideoTracks().forEach((t) => mixed.addTrack(t));
  destination.stream.getAudioTracks().forEach((t) => mixed.addTrack(t));

  logger.info('mixed streams with audio context', {
    videoTracks: mixed.getVideoTracks().length,
    audioTracks: mixed.getAudioTracks().length,
  });
  return mixed;
}