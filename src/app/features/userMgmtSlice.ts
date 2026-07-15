import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { getErrorMessage } from "../../utils/getErrorMessage";
import type { ApiResponse, PaginationResponse } from "../../types/api";
import type {
  AllUsersResponse,
  CreateUserRequest,
  UpdateUserAttributesRequest,
  UserParameters,
  UserResponse,
  UserStatusRequest,
} from "../../types/userMgmt";

interface UserMgmtState {
  users: AllUsersResponse[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  selectedUser: UserResponse | null;
  loading: boolean;
  detailLoading: boolean;
  mutating: boolean;
  error: string | null;
}

const initialState: UserMgmtState = {
  users: [],
  totalRecords: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: 10,
  selectedUser: null,
  loading: false,
  detailLoading: false,
  mutating: false,
  error: null,
};

function buildQueryParams(
  parameters: UserParameters
): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {};

  if (parameters.search) query.search = parameters.search;
  if (parameters.isActive !== undefined) query.isActive = parameters.isActive;
  if (parameters.startDate) query.startDate = parameters.startDate;
  if (parameters.endDate) query.endDate = parameters.endDate;
  if (parameters.pageNumber) query.pageNumber = parameters.pageNumber;
  if (parameters.pageSize) query.pageSize = parameters.pageSize;

  return query;
}

export const getUsers = createAsyncThunk(
  "userMgmt/getUsers",
  async (parameters: UserParameters, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PaginationResponse<AllUsersResponse>>
      >("users", { params: buildQueryParams(parameters) });
      return response.data.data;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getUser = createAsyncThunk(
  "userMgmt/getUser",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<UserResponse>>(
        `users/${id}`
      );
      return response.data.data;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Sent as multipart/form-data since CreateUserRequest now takes an optional
// ProfilePhoto (IFormFile) — this assumes the controller action switched from
// [FromBody] to [FromForm] to accommodate that, matching the file-upload pattern.
export const createUser = createAsyncThunk(
  "userMgmt/createUser",
  async (data: CreateUserRequest, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("FirstName", data.firstName);
      formData.append("LastName", data.lastName);
      formData.append("Email", data.email);
      data.attributes.forEach((id) => formData.append("Attributes", id));
      if (data.profilePhoto) formData.append("ProfilePhoto", data.profilePhoto);

      await axiosInstance.post<ApiResponse>("users/create", formData, {
        headers: { "Content-Type": undefined },
      });
      toast.success("User created successfully");
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateUserAttributes = createAsyncThunk(
  "userMgmt/updateUserAttributes",
  async (
    { id, data }: { id: string; data: UpdateUserAttributesRequest },
    { rejectWithValue }
  ) => {
    try {
      await axiosInstance.put<ApiResponse>(`users/${id}/attributes`, data);
      toast.success("User attributes updated successfully");
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// No controller route was provided for this one — UserMgmtService.UpdateUserStatusAsync
// exists but isn't exposed yet. Guessing PUT users/{id}/status; adjust once it's added.
export const updateUserStatus = createAsyncThunk(
  "userMgmt/updateUserStatus",
  async (
    { id, data }: { id: string; data: UserStatusRequest },
    { rejectWithValue }
  ) => {
    try {
      await axiosInstance.put<ApiResponse>(`users/${id}/status`, data);
      toast.success(data.isActive ? "User activated" : "User deactivated");
      return { id, isActive: data.isActive };
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "userMgmt/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete<ApiResponse>(`users/delete/${id}`);
      toast.success("User deleted successfully");
      return id;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const userMgmtSlice = createSlice({
  name: "userMgmt",
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getUsers.fulfilled,
        (state, action: PayloadAction<PaginationResponse<AllUsersResponse>>) => {
          state.loading = false;
          state.users = action.payload.records;
          state.totalRecords = action.payload.totalRecords;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
          state.pageSize = action.payload.pageSize;
        }
      )
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to load users";
      });

    builder
      .addCase(getUser.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action: PayloadAction<UserResponse>) => {
        state.detailLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = (action.payload as string) ?? "Failed to load user";
      });

    builder
      .addCase(createUser.pending, (state) => {
        state.mutating = true;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.mutating = false;
      })
      .addCase(createUser.rejected, (state) => {
        state.mutating = false;
      });

    builder
      .addCase(updateUserAttributes.pending, (state) => {
        state.mutating = true;
      })
      .addCase(updateUserAttributes.fulfilled, (state) => {
        state.mutating = false;
      })
      .addCase(updateUserAttributes.rejected, (state) => {
        state.mutating = false;
      });

    builder.addCase(
      updateUserStatus.fulfilled,
      (state, action: PayloadAction<{ id: string; isActive: boolean }>) => {
        const user = state.users.find((u) => u.id === action.payload.id);
        if (user) user.isActive = action.payload.isActive;
      }
    );

    builder.addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
      state.totalRecords = Math.max(0, state.totalRecords - 1);
    });
  },
});

export const { clearSelectedUser } = userMgmtSlice.actions;
export default userMgmtSlice.reducer;
