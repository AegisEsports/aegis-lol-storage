export type AuthenticationErrors =
  | 'NoUserIdParameter'
  | 'InvalidAuthorizationHeader'
  | 'InvalidAuthToken'
  | 'ExpiredAuthToken'
  | 'Mismatch'
  | 'UserOrRefreshTokenNotFound';

export type ApiErrors = 'NoIdParameter' | 'InvalidInput' | 'NotFound';

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

export type ErrorStatus = 400 | 401 | 403 | 404 | 409 | 500;
