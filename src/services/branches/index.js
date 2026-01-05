// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import {dynamicBaseQuery} from "../badRequestHandler"
// Define a service using a base URL and expected endpoints
export const branches = createApi({
  reducerPath: 'branches',
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    getBranches: builder.query({
      query: () => ({
        url: `/branches`,
        method: "GET",
      }),
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetBranchesQuery } = branches