// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import { dynamicBaseQuery } from "../badRequestHandler"
// Define a service using a base URL and expected endpoints
export const auth = createApi({
  reducerPath: 'auth',
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    emailCheck: builder.mutation({
      query: (body) => ({
        url: `/users/email-check`,
        method: "POST",
        body
      }),
    }),
    login: builder.mutation({
      query: (body) => ({
        url: `/auth/login`,
        method: "POST",
        body
      }),
    }),

  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useEmailCheckMutation,useLoginMutation } = auth