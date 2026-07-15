export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiryTimeStamp: string
  firstName: string
  lastName: string
  userType: string
  userId: string
  profilePhotoUrl: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
  email: string
  profilePhoto?: File
}
