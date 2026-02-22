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
  if (streams.length === 0) {
    throw new Error('no streams to mix');
  }

  const ctx = new AudioContext();
  const destination = ctx.createMediaStreamDestination();

  streams.forEach((stream, idx) => {
    stream.getAudioTracks().forEach((track) => {
      try {
        const single = new MediaStream([track]);
        const src = ctx.createMediaStreamSource(single);
        src.connect(destination);
      } catch (e) {
        // Safari などで MediaStreamSource がトラック単独だと例外になる場合
        logger.error('failed to create MediaStreamSource', { error: e, idx });
      }
    });
  });

  const mixed = new MediaStream();
  // video は最初のストリームから引き継ぐ
  const videoTracks = streams[0].getVideoTracks();
  if (videoTracks.length === 0) {
    logger.warn('no video tracks found on first stream when mixing', {
      streamIndex: 0,
      totalStreams: streams.length,
    });
  } else {
    videoTracks.forEach((t) => mixed.addTrack(t));
  }
  // ミキシングされた音声を追加
  destination.stream.getAudioTracks().forEach((t) => mixed.addTrack(t));
  logger.info('mixed streams', { videoTracks: mixed.getVideoTracks().length, audioTracks: mixed.getAudioTracks().length });
  return mixed;
}
