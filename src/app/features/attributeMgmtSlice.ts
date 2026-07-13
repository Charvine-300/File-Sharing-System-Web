import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { getErrorMessage } from "../../utils/getErrorMessage";
import type { ApiResponse, PaginationResponse } from "../../types/api";
import type {
  AllAttributesResponse,
  AttributeDetailsResponse,
  AttributeMgmtRequest,
  AttributeParameters,
} from "../../types/attributeMgmt";

interface AttributeMgmtState {
  attributes: AllAttributesResponse[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  selectedAttribute: AttributeDetailsResponse | null;
  // Unpaginated list of every attribute, used to populate checkbox pickers
  // (assigning attributes to a user) — kept separate from the paginated
  // `attributes` above so opening a picker never disturbs the admin table.
  catalog: AllAttributesResponse[];
  catalogLoading: boolean;
  loading: boolean;
  mutating: boolean;
  error: string | null;
}

const initialState: AttributeMgmtState = {
  attributes: [],
  totalRecords: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: 10,
  selectedAttribute: null,
  catalog: [],
  catalogLoading: false,
  loading: false,
  mutating: false,
  error: null,
};

function buildQueryParams(
  parameters: AttributeParameters
): Record<string, string | number> {
  const query: Record<string, string | number> = {};

  if (parameters.search) query.search = parameters.search;
  if (parameters.attributeType) query.attributeType = parameters.attributeType;
  if (parameters.pageNumber) query.pageNumber = parameters.pageNumber;
  if (parameters.pageSize) query.pageSize = parameters.pageSize;

  return query;
}

export const getAttributes = createAsyncThunk(
  "attributeMgmt/getAttributes",
  async (parameters: AttributeParameters, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PaginationResponse<AllAttributesResponse>>
      >("attributes", { params: buildQueryParams(parameters) });
      return response.data.data;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getAttributeCatalog = createAsyncThunk(
  "attributeMgmt/getAttributeCatalog",
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PaginationResponse<AllAttributesResponse>>
      >("attributes", { params: { pageNumber: 1, pageSize: 500 } });
      return response.data.data.records;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getAttributeDetails = createAsyncThunk(
  "attributeMgmt/getAttributeDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<AttributeDetailsResponse>>(
        `attributes/${id}`
      );
      return response.data.data;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createAttribute = createAsyncThunk(
  "attributeMgmt/createAttribute",
  async (data: AttributeMgmtRequest, { rejectWithValue }) => {
    try {
      await axiosInstance.post<ApiResponse>("attributes/create", data);
      toast.success("Attribute created successfully");
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateAttribute = createAsyncThunk(
  "attributeMgmt/updateAttribute",
  async (
    { id, data }: { id: string; data: AttributeMgmtRequest },
    { rejectWithValue }
  ) => {
    try {
      await axiosInstance.put<ApiResponse>(`attributes/update/${id}`, data);
      toast.success("Attribute updated successfully");
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteAttribute = createAsyncThunk(
  "attributeMgmt/deleteAttribute",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete<ApiResponse>(`attributes/delete/${id}`);
      toast.success("Attribute deleted successfully");
      return id;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const attributeMgmtSlice = createSlice({
  name: "attributeMgmt",
  initialState,
  reducers: {
    clearSelectedAttribute: (state) => {
      state.selectedAttribute = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAttributes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAttributes.fulfilled,
        (state, action: PayloadAction<PaginationResponse<AllAttributesResponse>>) => {
          state.loading = false;
          state.attributes = action.payload.records;
          state.totalRecords = action.payload.totalRecords;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
          state.pageSize = action.payload.pageSize;
        }
      )
      .addCase(getAttributes.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to load attributes";
      });

    builder
      .addCase(getAttributeCatalog.pending, (state) => {
        state.catalogLoading = true;
      })
      .addCase(
        getAttributeCatalog.fulfilled,
        (state, action: PayloadAction<AllAttributesResponse[]>) => {
          state.catalogLoading = false;
          state.catalog = action.payload;
        }
      )
      .addCase(getAttributeCatalog.rejected, (state) => {
        state.catalogLoading = false;
      });

    builder
      .addCase(getAttributeDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAttributeDetails.fulfilled,
        (state, action: PayloadAction<AttributeDetailsResponse>) => {
          state.loading = false;
          state.selectedAttribute = action.payload;
        }
      )
      .addCase(getAttributeDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to load attribute";
      });

    builder
      .addCase(createAttribute.pending, (state) => {
        state.mutating = true;
      })
      .addCase(createAttribute.fulfilled, (state) => {
        state.mutating = false;
      })
      .addCase(createAttribute.rejected, (state) => {
        state.mutating = false;
      });

    builder
      .addCase(updateAttribute.pending, (state) => {
        state.mutating = true;
      })
      .addCase(updateAttribute.fulfilled, (state) => {
        state.mutating = false;
      })
      .addCase(updateAttribute.rejected, (state) => {
        state.mutating = false;
      });

    builder.addCase(
      deleteAttribute.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.attributes = state.attributes.filter((a) => a.id !== action.payload);
        state.totalRecords = Math.max(0, state.totalRecords - 1);
      }
    );
  },
});

export const { clearSelectedAttribute } = attributeMgmtSlice.actions;
export default attributeMgmtSlice.reducer;
