/**
 * シンプルなシリアル番号付きロガー
 * @module logger
 */

let counter = 0;

/**
 * CaptorLogger は簡易的なコンソールロギングを提供します。
 * 各メッセージにシリアル番号とタイムスタンプを付与します。
 */
export class CaptorLogger {
  /**
   * ログのシリアル番号を生成して返す
   */
  private static nextSerial(): number {
    return ++counter;
  }

  /**
   * 情報レベルのメッセージを出力します。
   * @param message - ログ本文
   * @param context - 任意の追加情報
   */
  public info(message: string, context?: Record<string, unknown>): void {
    const serial = CaptorLogger.nextSerial();
    const ts = new Date().toISOString();
    console.info(`[${serial}] [INFO] ${ts} - ${message}`, context || '');
  }

  /**
   * 警告レベルのメッセージを出力します。
   * @param message - ログ本文
   * @param context - 任意の追加情報
   */
  public warn(message: string, context?: Record<string, unknown>): void {
    const serial = CaptorLogger.nextSerial();
    const ts = new Date().toISOString();
    console.warn(`[${serial}] [WARN] ${ts} - ${message}`, context || '');
  }

  /**
   * エラーレベルのメッセージを出力します。
   * @param message - ログ本文
   * @param context - 任意の追加情報
   */
  public error(message: string, context?: Record<string, unknown>): void {
    const serial = CaptorLogger.nextSerial();
    const ts = new Date().toISOString();
    console.error(`[${serial}] [ERROR] ${ts} - ${message}`, context || '');
  }
}

// 単一インスタンスをエクスポート
export const logger = new CaptorLogger();
