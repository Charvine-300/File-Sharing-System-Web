import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import publicAxios from "../../utils/publicAxios";
import axiosInstance from "../../utils/axiosInstance";
import type { ApiResponse } from "../../types/api";
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
} from "../../types/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiryTimeStamp: string | null;
  firstName: string | null;
  lastName: string | null;
  userType: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  expiryTimeStamp: localStorage.getItem("expiryTimeStamp"),
  firstName: localStorage.getItem("firstName"),
  lastName: localStorage.getItem("lastName"),
  userType: localStorage.getItem("userType"),
  isAuthenticated: Boolean(localStorage.getItem("accessToken")),
  loading: false,
  error: null,
};

function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const message = (err.response?.data as { message?: string } | undefined)
      ?.message;
    return message ?? "An error occurred";
  }
  return "An error occurred";
}

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
      const message = getErrorMessage(err);
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
      const message = getErrorMessage(err);
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
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("expiryTimeStamp");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");
      localStorage.removeItem("userType");

      state.accessToken = null;
      state.refreshToken = null;
      state.expiryTimeStamp = null;
      state.firstName = null;
      state.lastName = null;
      state.userType = null;
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

          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("expiryTimeStamp", expiryTimeStamp);
          localStorage.setItem("firstName", firstName);
          localStorage.setItem("lastName", lastName);
          localStorage.setItem("userType", userType);

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
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
