import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { message } from "antd";
import { toast } from "react-toastify";

export const dynamicBaseQuery = async (args, WebApi, extraOptions) => {
  const rawBaseQuery = fetchBaseQuery({
    // baseUrl: "http://192.168.2.107:5001/api/",
    baseUrl: "http://13.232.199.92:5000/api",
  
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  const result = await rawBaseQuery(args, WebApi, extraOptions);
  if (result?.error) {
    const responseMessage = result?.error?.data?.error || result?.error?.data?.message || 'An error occurred';
    const status = result?.error?.status;
    if (status === 401) {
      localStorage.clear();
      window.location.replace("/login");
    } else {
      console.log('Error message from server:', responseMessage);
      message.error(responseMessage);
    }
  }
  // If we have a data payload, prefer showing its `message` when present.
  if (result?.data) {
    const res = result.data;
    const msg = res?.message || res?.msg || null;
    const successFlag = res?.success ?? res?.status ?? null;

    if (msg) {
      // Determine whether to show success or error depending on common flag shapes
      if (successFlag === false || successFlag === 0) {
        message.error(msg);
      } else {
        // treat missing/true/positive values as success
        message.success(msg);
      }
    }
  }
  return result;
};
