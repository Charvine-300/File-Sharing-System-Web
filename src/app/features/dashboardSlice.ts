import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { getErrorMessage } from "../../utils/getErrorMessage";
import type { ApiResponse } from "../../types/api";
import type { DashboardSummaryResponse, RecentFileResponse } from "../../types/dashboard";

interface DashboardState {
  summary: DashboardSummaryResponse | null;
  recentFiles: RecentFileResponse[];
  summaryLoading: boolean;
  recentFilesLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  recentFiles: [],
  summaryLoading: false,
  recentFilesLoading: false,
  error: null,
};

export const getDashboardSummary = createAsyncThunk(
  "dashboard/getSummary",
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<DashboardSummaryResponse>>(
        "dashboard/summary"
      );
      return response.data.data;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getRecentFiles = createAsyncThunk(
  "dashboard/getRecentFiles",
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<RecentFileResponse[]>>(
        "dashboard/recent-files"
      );
      return response.data.data;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardSummary.pending, (state) => {
        state.summaryLoading = true;
        state.error = null;
      })
      .addCase(
        getDashboardSummary.fulfilled,
        (state, action: PayloadAction<DashboardSummaryResponse>) => {
          state.summaryLoading = false;
          state.summary = action.payload;
        }
      )
      .addCase(getDashboardSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.error = (action.payload as string) ?? "Failed to load dashboard summary";
      });

    builder
      .addCase(getRecentFiles.pending, (state) => {
        state.recentFilesLoading = true;
      })
      .addCase(
        getRecentFiles.fulfilled,
        (state, action: PayloadAction<RecentFileResponse[]>) => {
          state.recentFilesLoading = false;
          state.recentFiles = action.payload;
        }
      )
      .addCase(getRecentFiles.rejected, (state) => {
        state.recentFilesLoading = false;
      });
  },
});

export default dashboardSlice.reducer;
