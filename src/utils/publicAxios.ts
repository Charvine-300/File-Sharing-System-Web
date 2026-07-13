import axios, { type AxiosInstance } from "axios";

// Unauthenticated client — for endpoints called before we hold an access token (e.g. login).
// Deliberately does not share axiosInstance's 401 interceptor: a bad-credentials 401 here
// should surface as a form error, not force-redirect away from the login page.
const publicAxios: AxiosInstance = axios.create({
  baseURL: import.meta.env.REACT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default publicAxios;
