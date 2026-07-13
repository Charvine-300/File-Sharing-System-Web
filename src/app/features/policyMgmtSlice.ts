import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { getErrorMessage } from "../../utils/getErrorMessage";
import type { ApiResponse, PaginationResponse } from "../../types/api";
import type {
  AllPoliciesResponse,
  CreatePolicyRequest,
  PolicyDetailsResponse,
  PolicyParameters,
  UpdatePolicyRequest,
} from "../../types/policyMgmt";

interface PolicyMgmtState {
  policies: AllPoliciesResponse[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  selectedPolicy: PolicyDetailsResponse | null;
  loading: boolean;
  detailLoading: boolean;
  mutating: boolean;
  error: string | null;
}

const initialState: PolicyMgmtState = {
  policies: [],
  totalRecords: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: 10,
  selectedPolicy: null,
  loading: false,
  detailLoading: false,
  mutating: false,
  error: null,
};

function buildQueryParams(
  parameters: PolicyParameters
): Record<string, string | number> {
  const query: Record<string, string | number> = {};

  if (parameters.search) query.search = parameters.search;
  if (parameters.startDate) query.startDate = parameters.startDate;
  if (parameters.endDate) query.endDate = parameters.endDate;
  if (parameters.pageNumber) query.pageNumber = parameters.pageNumber;
  if (parameters.pageSize) query.pageSize = parameters.pageSize;

  return query;
}

export const getPolicies = createAsyncThunk(
  "policyMgmt/getPolicies",
  async (parameters: PolicyParameters, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PaginationResponse<AllPoliciesResponse>>
      >("policies", { params: buildQueryParams(parameters) });
      return response.data.data;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getPolicy = createAsyncThunk(
  "policyMgmt/getPolicy",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<PolicyDetailsResponse>>(
        `policies/${id}`
      );
      return response.data.data;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createPolicy = createAsyncThunk(
  "policyMgmt/createPolicy",
  async (data: CreatePolicyRequest, { rejectWithValue }) => {
    try {
      await axiosInstance.post<ApiResponse>("policies/create", data);
      toast.success("Policy created successfully");
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updatePolicy = createAsyncThunk(
  "policyMgmt/updatePolicy",
  async (
    { id, data }: { id: string; data: UpdatePolicyRequest },
    { rejectWithValue }
  ) => {
    try {
      await axiosInstance.put<ApiResponse>(`policies/${id}`, data);
      toast.success("Policy updated successfully");
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deletePolicy = createAsyncThunk(
  "policyMgmt/deletePolicy",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete<ApiResponse>(`policies/${id}`);
      toast.success("Policy deleted successfully");
      return id;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const policyMgmtSlice = createSlice({
  name: "policyMgmt",
  initialState,
  reducers: {
    clearSelectedPolicy: (state) => {
      state.selectedPolicy = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPolicies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getPolicies.fulfilled,
        (state, action: PayloadAction<PaginationResponse<AllPoliciesResponse>>) => {
          state.loading = false;
          state.policies = action.payload.records;
          state.totalRecords = action.payload.totalRecords;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
          state.pageSize = action.payload.pageSize;
        }
      )
      .addCase(getPolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to load policies";
      });

    builder
      .addCase(getPolicy.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(
        getPolicy.fulfilled,
        (state, action: PayloadAction<PolicyDetailsResponse>) => {
          state.detailLoading = false;
          state.selectedPolicy = action.payload;
        }
      )
      .addCase(getPolicy.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = (action.payload as string) ?? "Failed to load policy";
      });

    builder
      .addCase(createPolicy.pending, (state) => {
        state.mutating = true;
      })
      .addCase(createPolicy.fulfilled, (state) => {
        state.mutating = false;
      })
      .addCase(createPolicy.rejected, (state) => {
        state.mutating = false;
      });

    builder
      .addCase(updatePolicy.pending, (state) => {
        state.mutating = true;
      })
      .addCase(updatePolicy.fulfilled, (state) => {
        state.mutating = false;
      })
      .addCase(updatePolicy.rejected, (state) => {
        state.mutating = false;
      });

    builder.addCase(
      deletePolicy.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.policies = state.policies.filter((p) => p.id !== action.payload);
        state.totalRecords = Math.max(0, state.totalRecords - 1);
      }
    );
  },
});

export const { clearSelectedPolicy } = policyMgmtSlice.actions;
export default policyMgmtSlice.reducer;
