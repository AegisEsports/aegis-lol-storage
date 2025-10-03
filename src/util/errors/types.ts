export type ErrorStatus = 400 | 401 | 403 | 404 | 409 | 500 | 503;

export type AuthenticationErrors =
  | 'NoUserIdParameter'
  | 'InvalidAuthorizationHeader'
  | 'InvalidAuthToken'
  | 'ExpiredAuthToken'
  | 'Mismatch'
  | 'UserOrRefreshTokenNotFound';

export type ApiErrors =
  | 'NoIdParameter'
  | 'InvalidInput'
  | 'NotFound'
  | 'RiotApiError';

export type SignInMethodApiErrors =
  | 'InvalidSignInMethod'
  | 'UserAlreadyHasSignInMethod'
  | 'PasswordTooWeak'
  | 'PasswordTooLong'
  | 'InvalidCredentials'
  | 'InvalidRefreshToken'
  | 'RefreshTokenUserIdMismatch';

export type ErrorCode =
  | 'UnknownError'
  | AuthenticationErrors
  | ApiErrors
  | SignInMethodApiErrors;
