import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import publicAxios from "../../utils/publicAxios";
import axiosInstance from "../../utils/axiosInstance";
import { getErrorMessage } from "../../utils/getErrorMessage";
import type { ApiResponse } from "../../types/api";
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  UpdateProfileRequest,
} from "../../types/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiryTimeStamp: string | null;
  firstName: string | null;
  lastName: string | null;
  // Not returned by LoginResponse — only known once the user has saved it once
  // via Edit Profile, since there's no endpoint yet that returns the current
  // user's own email.
  email: string | null;
  userType: string | null;
  // Not yet returned by the API — wired up so the UI has somewhere to put it once it is.
  profileImageUrl: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  accessToken: sessionStorage.getItem("accessToken"),
  refreshToken: sessionStorage.getItem("refreshToken"),
  expiryTimeStamp: sessionStorage.getItem("expiryTimeStamp"),
  firstName: sessionStorage.getItem("firstName"),
  lastName: sessionStorage.getItem("lastName"),
  email: sessionStorage.getItem("email"),
  userType: sessionStorage.getItem("userType"),
  profileImageUrl: sessionStorage.getItem("profileImageUrl"),
  isAuthenticated: Boolean(sessionStorage.getItem("accessToken")),
  loading: false,
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

// Endpoint is a guess — there's no controller for this yet, adjust the URL/shape once one exists.
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data: UpdateProfileRequest, { rejectWithValue }) => {
    try {
      await axiosInstance.put<ApiResponse>("auth/update-profile", data);
      toast.success("Profile updated");
      return data;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("expiryTimeStamp");
      sessionStorage.removeItem("firstName");
      sessionStorage.removeItem("lastName");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("userType");
      sessionStorage.removeItem("profileImageUrl");

      state.accessToken = null;
      state.refreshToken = null;
      state.expiryTimeStamp = null;
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
            firstName,
            lastName,
            userType,
          } = action.payload;

          sessionStorage.setItem("accessToken", accessToken);
          sessionStorage.setItem("refreshToken", refreshToken);
          sessionStorage.setItem("expiryTimeStamp", expiryTimeStamp);
          sessionStorage.setItem("firstName", firstName);
          sessionStorage.setItem("lastName", lastName);
          sessionStorage.setItem("userType", userType);

          state.loading = false;
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
          state.expiryTimeStamp = expiryTimeStamp;
          state.firstName = firstName;
          state.lastName = lastName;
          state.userType = userType;
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
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateProfile.fulfilled,
        (state, action: PayloadAction<UpdateProfileRequest>) => {
          const { firstName, lastName, email } = action.payload;

          sessionStorage.setItem("firstName", firstName);
          sessionStorage.setItem("lastName", lastName);
          sessionStorage.setItem("email", email);

          state.loading = false;
          state.firstName = firstName;
          state.lastName = lastName;
          state.email = email;
        }
      )
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Profile update failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
