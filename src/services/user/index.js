// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import {dynamicBaseQuery} from "../badRequestHandler"
// Define a service using a base URL and expected endpoints
export const user = createApi({
  reducerPath: 'user',
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    adduser: builder.mutation({
      query: (body) => ({
        url: `/users`,
        method: "POST",
        body,
      }),
      invalidatesTags:["user"]
    }),
    getAllUser: builder.query({
      query: (params) => {
        let url = `/users`;
        if (params && (params.page || params.limit)) {
          const search = [];
          if (params.page) search.push(`page=${params.page}`);
          if (params.limit) search.push(`limit=${params.limit}`);
          url += `?${search.join('&')}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags:["user"]
    }),
    getAttachUserList: builder.query({
      query: () => ({
        url: `/users/simple-list`,
        method: "GET",
      }),
    }),
   
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useAdduserMutation, useGetAttachUserListQuery,useGetAllUserQuery } = user