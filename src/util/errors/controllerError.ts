import type { ErrorCode, ErrorStatus } from './types.js';

export default class ControllerError extends Error {
  readonly status: ErrorStatus;

  readonly code: ErrorCode;

  readonly data?: unknown;

  constructor(
    status: ErrorStatus,
    code: ErrorCode,
    message: string,
    data?: unknown,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = data;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
    };
  }
}
