export type AuthenticationErrors =
  | 'NoUserIdParameter'
  | 'InvalidAuthorizationHeader'
  | 'InvalidAuthToken'
  | 'ExpiredAuthToken'
  | 'UserMismatch'
  | 'UserOrRefreshTokenNotFound';

export type UserApiErrors = 'InvalidUser' | 'UserNotFound';

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
  | UserApiErrors
  | SignInMethodApiErrors;

export type ErrorStatus = 400 | 401 | 403 | 404 | 409 | 500;
