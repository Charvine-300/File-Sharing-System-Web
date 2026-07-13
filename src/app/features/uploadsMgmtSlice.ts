import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { getErrorMessage } from "../../utils/getErrorMessage";
import type { ApiResponse, PaginationResponse } from "../../types/api";
import type {
  FileDetailsResponse,
  FileParameters,
  FileResponse,
} from "../../types/uploadsMgmt";

interface UploadsMgmtState {
  files: FileResponse[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  selectedFile: FileDetailsResponse | null;
  loading: boolean;
  detailLoading: boolean;
  mutating: boolean;
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
}

const initialState: UploadsMgmtState = {
  files: [],
  totalRecords: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: 10,
  selectedFile: null,
  loading: false,
  detailLoading: false,
  mutating: false,
  uploading: false,
  uploadProgress: 0,
  error: null,
};

function buildQueryParams(
  parameters: FileParameters
): Record<string, string | number> {
  const query: Record<string, string | number> = {};

  if (parameters.search) query.search = parameters.search;
  if (parameters.startDate) query.startDate = parameters.startDate;
  if (parameters.endDate) query.endDate = parameters.endDate;
  if (parameters.pageNumber) query.pageNumber = parameters.pageNumber;
  if (parameters.pageSize) query.pageSize = parameters.pageSize;

  return query;
}

export const getFiles = createAsyncThunk(
  "uploadsMgmt/getFiles",
  async (parameters: FileParameters, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PaginationResponse<FileResponse>>
      >("uploads", { params: buildQueryParams(parameters) });
      return response.data.data;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getFile = createAsyncThunk(
  "uploadsMgmt/getFile",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<FileDetailsResponse>>(
        `uploads/${id}`
      );
      return response.data.data;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// FileMgmtRequest binds via [FromForm] on the backend, so this goes as
// multipart/form-data — field names ("File", "PolicyId") must match the C#
// property names for ASP.NET's model binder to pick them up.
export const uploadFile = createAsyncThunk(
  "uploadsMgmt/uploadFile",
  async (
    { file, policyId }: { file: File; policyId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("File", file);
      formData.append("PolicyId", policyId);

      await axiosInstance.post<ApiResponse>("uploads/upload-document", formData, {
        // axiosInstance defaults Content-Type to application/json — that has to be
        // cleared here so the browser can set multipart/form-data with the correct
        // boundary itself. Leaving the json default in place is what causes
        // ASP.NET's multipart parser to bail and bind `request.File` as null.
        headers: { "Content-Type": undefined },
        onUploadProgress: (event) => {
          if (!event.total) return;
          dispatch(setUploadProgress(Math.round((event.loaded / event.total) * 100)));
        },
      });

      toast.success("File uploaded successfully");
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Backend currently throws NotImplementedException for this route
// (UploadsMgmtService.UpdateFilePolicyAsync) — wired up here so it's ready
// the moment that lands; there's no UI action calling it yet.
export const updateFilePolicy = createAsyncThunk(
  "uploadsMgmt/updateFilePolicy",
  async (
    { id, policyId }: { id: string; policyId: string },
    { rejectWithValue }
  ) => {
    try {
      await axiosInstance.put<ApiResponse>(`uploads/${id}/update-policy`, {
        policyId,
      });
      toast.success("File policy updated successfully");
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteFile = createAsyncThunk(
  "uploadsMgmt/deleteFile",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete<ApiResponse>(`uploads/${id}`);
      toast.success("File deleted successfully");
      return id;
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// The download endpoint returns raw file bytes (not an ApiResponse envelope),
// so this bypasses the usual `.data.data` unwrap and streams straight to a blob.
export const downloadFile = createAsyncThunk(
  "uploadsMgmt/downloadFile",
  async (
    { id, fileName }: { id: string; fileName: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(
        `uploads/${id}/download-document`,
        null,
        { responseType: "blob" }
      );

      const blobUrl = URL.createObjectURL(response.data as Blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      const message = await getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const uploadsMgmtSlice = createSlice({
  name: "uploadsMgmt",
  initialState,
  reducers: {
    clearSelectedFile: (state) => {
      state.selectedFile = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getFiles.fulfilled,
        (state, action: PayloadAction<PaginationResponse<FileResponse>>) => {
          state.loading = false;
          state.files = action.payload.records;
          state.totalRecords = action.payload.totalRecords;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
          state.pageSize = action.payload.pageSize;
        }
      )
      .addCase(getFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to load files";
      });

    builder
      .addCase(getFile.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(getFile.fulfilled, (state, action: PayloadAction<FileDetailsResponse>) => {
        state.detailLoading = false;
        state.selectedFile = action.payload;
      })
      .addCase(getFile.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = (action.payload as string) ?? "Failed to load file";
      });

    builder
      .addCase(uploadFile.pending, (state) => {
        state.uploading = true;
        state.uploadProgress = 0;
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.uploading = false;
        state.uploadProgress = 100;
      })
      .addCase(uploadFile.rejected, (state) => {
        state.uploading = false;
      });

    builder
      .addCase(updateFilePolicy.pending, (state) => {
        state.mutating = true;
      })
      .addCase(updateFilePolicy.fulfilled, (state) => {
        state.mutating = false;
      })
      .addCase(updateFilePolicy.rejected, (state) => {
        state.mutating = false;
      });

    builder.addCase(deleteFile.fulfilled, (state, action: PayloadAction<string>) => {
      state.files = state.files.filter((f) => f.id !== action.payload);
      state.totalRecords = Math.max(0, state.totalRecords - 1);
    });
  },
});

export const { clearSelectedFile, setUploadProgress } = uploadsMgmtSlice.actions;
export default uploadsMgmtSlice.reducer;
