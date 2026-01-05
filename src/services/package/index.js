
// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import { dynamicBaseQuery } from "../badRequestHandler"
// Define a service using a base URL and expected endpoints
export const plans = createApi({
  reducerPath: 'plans',
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    addPlan: builder.mutation({
      query: (body) => ({
        url: `/plans/add`,
        method: "POST",
        body
      }),
    }),
    getPlans: builder.query({
      query: (body) => ({
        url: `/plans`,
        method: "GET",
        body
      }),
    }),
  

  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useAddPlanMutation,useGetPlansQuery } = plans