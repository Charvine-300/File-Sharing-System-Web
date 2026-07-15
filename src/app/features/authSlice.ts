import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import publicAxios from "../../utils/publicAxios";
import axiosInstance from "../../utils/axiosInstance";
import { getErrorMessage } from "../../utils/getErrorMessage";
import type { RootState } from "../store";
import type { ApiResponse } from "../../types/api";
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  UpdateProfileRequest,
} from "../../types/auth";
import type { UserResponse } from "../../types/userMgmt";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiryTimeStamp: string | null;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  userType: string | null;
  profileImageUrl: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  // Separate from `loading` so the background refresh on mount / after save
  // doesn't make unrelated buttons (Save changes) flash a spinner.
  fetchingProfile: boolean;
  error: string | null;
}

const initialState: AuthState = {
  accessToken: sessionStorage.getItem("accessToken"),
  refreshToken: sessionStorage.getItem("refreshToken"),
  expiryTimeStamp: sessionStorage.getItem("expiryTimeStamp"),
  userId: sessionStorage.getItem("userId"),
  firstName: sessionStorage.getItem("firstName"),
  lastName: sessionStorage.getItem("lastName"),
  email: sessionStorage.getItem("email"),
  userType: sessionStorage.getItem("userType"),
  profileImageUrl: sessionStorage.getItem("profileImageUrl"),
  isAuthenticated: Boolean(sessionStorage.getItem("accessToken")),
  loading: false,
  fetchingProfile: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await publicAxios.post<ApiResponse<LoginResponse>>(
        "auth/login",
        data
      );
      return response.data.data;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      await axiosInstance.post<ApiResponse>("auth/change-password", data);
      toast.success("Password changed successfully");
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Re-fetches the current user from the source of truth (GET users/{id}) and
// syncs both Redux state and sessionStorage from it — used to populate Edit
// Profile with fresher data than what login returned, and to refresh after a
// save. NOTE: that route is [SuperAdmin]-gated on UsersController as of the
// last controller you shared — if it hasn't been opened up for a user to read
// their own record, this will 403 for a RegularUser and just fall back to
// whatever's already in state (handled gracefully, but worth fixing server-side).
export const fetchCurrentUser = createAsyncThunk<
  UserResponse,
  void,
  { state: RootState; rejectValue: string }
>("auth/fetchCurrentUser", async (_, { getState, rejectWithValue }) => {
  const userId = getState().auth.userId;
  if (!userId) {
    return rejectWithValue("Missing current user id");
  }

  try {
    const response = await axiosInstance.get<ApiResponse<UserResponse>>(
      `users/${userId}`
    );

    return response.data.data;
  } catch (err) {
    const message = await getErrorMessage(err);
    return rejectWithValue(message);
  }
});

// Uses the real self-editing route (PUT users/update/{id}) — this only became
// possible once LoginResponse started returning UserId. On success, re-fetches
// the user record rather than trusting the submitted form values as the new
// state (the backend is the source of truth, and this is also what refreshes
// sessionStorage/the header avatar).
export const updateProfile = createAsyncThunk<
  void,
  UpdateProfileRequest,
  { state: RootState; rejectValue: string }
>("auth/updateProfile", async (data, { dispatch, getState, rejectWithValue }) => {
  const userId = getState().auth.userId;
  if (!userId) {
    const message = "Missing current user id — try logging in again.";
    toast.error(message);
    return rejectWithValue(message);
  }

  try {
    const formData = new FormData();
    formData.append("FirstName", data.firstName);
    formData.append("LastName", data.lastName);
    formData.append("Email", data.email);
    if (data.profilePhoto) formData.append("ProfilePhoto", data.profilePhoto);

    await axiosInstance.put<ApiResponse>(`users/update/${userId}`, formData, {
      headers: { "Content-Type": undefined },
    });
    toast.success("Profile updated");
    await dispatch(fetchCurrentUser());
  } catch (err) {
    const message = await getErrorMessage(err);
    toast.error(message);
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("expiryTimeStamp");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("firstName");
      sessionStorage.removeItem("lastName");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("userType");
      sessionStorage.removeItem("profileImageUrl");

      state.accessToken = null;
      state.refreshToken = null;
      state.expiryTimeStamp = null;
      state.userId = null;
      state.firstName = null;
      state.lastName = null;
      state.email = null;
      state.userType = null;
      state.profileImageUrl = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          const {
            accessToken,
            refreshToken,
            expiryTimeStamp,
            userId,
            firstName,
            lastName,
            userType,
            profilePhotoUrl,
          } = action.payload;

          sessionStorage.setItem("accessToken", accessToken);
          sessionStorage.setItem("refreshToken", refreshToken);
          sessionStorage.setItem("expiryTimeStamp", expiryTimeStamp);
          sessionStorage.setItem("userId", userId);
          sessionStorage.setItem("firstName", firstName);
          sessionStorage.setItem("lastName", lastName);
          sessionStorage.setItem("userType", userType);
          sessionStorage.setItem("profileImageUrl", profilePhotoUrl);

          state.loading = false;
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
          state.expiryTimeStamp = expiryTimeStamp;
          state.userId = userId;
          state.firstName = firstName;
          state.lastName = lastName;
          state.userType = userType;
          state.profileImageUrl = profilePhotoUrl;
          state.isAuthenticated = true;
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Login failed";
      });

    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Password change failed";
      });

    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.fetchingProfile = true;
      })
      .addCase(
        fetchCurrentUser.fulfilled,
        (state, action: PayloadAction<UserResponse>) => {
          const { firstName, lastName, email, profilePhotoUrl } = action.payload;

          sessionStorage.setItem("firstName", firstName);
          sessionStorage.setItem("lastName", lastName);
          sessionStorage.setItem("email", email);

          state.fetchingProfile = false;
          state.firstName = firstName;
          state.lastName = lastName;
          state.email = email;

          if (profilePhotoUrl) {
            sessionStorage.setItem("profileImageUrl", profilePhotoUrl);
            state.profileImageUrl = profilePhotoUrl;
          }
        }
      )
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.fetchingProfile = false;
      });

    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Profile update failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
