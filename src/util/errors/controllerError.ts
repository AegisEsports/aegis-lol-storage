import { ErrorCode, ErrorStatus } from './types';

export default class ControllerError extends Error {
  readonly status: ErrorStatus;

  readonly code: ErrorCode;

  readonly data?: any;

  constructor(
    status: ErrorStatus,
    code: ErrorCode,
    message: string,
    data?: any,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = data;
  }

  toJSON() {
    return {
      error: { code: this.code, message: this.message },
    };
  }
}
