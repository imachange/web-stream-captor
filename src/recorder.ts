/**
 * recorder.ts
 * MediaRecorder のラッパー
 */
import { logger } from './logger';

/**
 * 録画の状態を表す文字列リテラル型
 */
export type RecorderState = 'idle' | 'recording' | 'paused' | 'stopped';

export const RecorderStates = {
  Idle: 'idle' as RecorderState,
  Recording: 'recording' as RecorderState,
  Paused: 'paused' as RecorderState,
  Stopped: 'stopped' as RecorderState,
};

/**
 * MediaStream を受け取り録画を制御するクラス。
 *
 * コンストラクタに渡したストリームは内部で停止されません。
 * `stop()` を呼ぶと Blob が生成され、ダウンロード用 URL を返します。
 */
export class Recorder {
  private mediaRecorder: MediaRecorder;
  private chunks: Blob[] = [];
  private _state: RecorderState = RecorderStates.Idle;

  /**
   * 現在の状態
   */
  public get state(): RecorderState {
    return this._state;
  }

  /**
   * コンストラクタ
   * @param stream 録画対象の MediaStream
   * @param mimeType MediaRecorder に渡す mimeType
   */
  constructor(stream: MediaStream, mimeType?: string) {
    logger.info('creating Recorder', { stream });
    const options: MediaRecorderOptions = {};
    if (mimeType) {
      options.mimeType = mimeType;
    }
    this.mediaRecorder = new MediaRecorder(stream, options);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };
    this.mediaRecorder.onstart = () => {
      this._state = RecorderStates.Recording;
      logger.info('mediaRecorder started');
    };
    this.mediaRecorder.onpause = () => {
      this._state = RecorderStates.Paused;
      logger.info('mediaRecorder paused');
    };
    this.mediaRecorder.onresume = () => {
      this._state = RecorderStates.Recording;
      logger.info('mediaRecorder resumed');
    };
    this.mediaRecorder.onstop = () => {
      this._state = RecorderStates.Stopped;
      logger.info('mediaRecorder stopped');
    };
    this.mediaRecorder.onerror = (ev) => {
      logger.error('mediaRecorder error', { event: ev });
    };
  }

  /**
   * 録画開始
   * @throws {DOMException}
   */
  public start(): void {
    logger.info('recorder.start()');
    // MediaRecorder は state が "inactive" のときのみ start() を呼び出せる。
    // それ以外の状態で呼び出すと DOMException がスローされるため、ここでガードする。
    if (this.mediaRecorder.state !== 'inactive') {
      logger.info('recorder.start() called while MediaRecorder is not inactive', {
        state: this.mediaRecorder.state,
      });
      return;
    }
    this.mediaRecorder.start();
  }

  /**
   * 一時停止
   */
  public pause(): void {
    if (this.mediaRecorder.state === 'recording') {
      logger.info('recorder.pause()');
      this.mediaRecorder.pause();
    }
  }

  /**
   * 再開
   */
  public resume(): void {
    if (this.mediaRecorder.state === 'paused') {
      logger.info('recorder.resume()');
      this.mediaRecorder.resume();
    }
  }

  /**
   * 録画停止し、Blob を返します。
   * MediaStream のトラックは停止しません。
   *
   * @returns Promise<Blob> 完了した録画データ
   */
  public stop(): Promise<Blob> {
    logger.info('recorder.stop()');
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        this._state = RecorderStates.Stopped;
        logger.info('mediaRecorder stopped (stop promise)');
        const blob = new Blob(this.chunks, { type: this.mediaRecorder.mimeType });
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }
}
