import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import userMgmtReducer from "./features/userMgmtSlice";
import attributeMgmtReducer from "./features/attributeMgmtSlice";
import policyMgmtReducer from "./features/policyMgmtSlice";
import uploadsMgmtReducer from "./features/uploadsMgmtSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userMgmt: userMgmtReducer,
    attributeMgmt: attributeMgmtReducer,
    policyMgmt: policyMgmtReducer,
    uploadsMgmt: uploadsMgmtReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
