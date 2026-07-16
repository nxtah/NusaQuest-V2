export type SuccessResult<T> = {
  success: true;
  data: T;
  error: null;
};

export type FailureResult = {
  success: false;
  data: null;
  error: string;
};

export type AppResult<T> = SuccessResult<T> | FailureResult;

export function toSuccess<T>(data: T): AppResult<T> {
  return {
    success: true,
    data,
    error: null,
  };
}

export function toFailure<T = never>(error: unknown): AppResult<T> {
  const message = error instanceof Error ? error.message : 'Unknown error';

  return {
    success: false,
    data: null,
    error: message,
  };
}
