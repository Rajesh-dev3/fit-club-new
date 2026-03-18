
// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import { dynamicBaseQuery } from "../badRequestHandler"
// Define a service using a base URL and expected endpoints
export const plans = createApi({
  reducerPath: 'plans',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Plans'],
  endpoints: (builder) => ({
    addPlan: builder.mutation({
      query: (body) => ({
        url: `/plans/add`,
        method: "POST",
        body
      }),
      invalidatesTags: ['Plans'],
    }),
    getPlans: builder.query({
      query: (body) => ({
        url: `/plans`,
        method: "GET",
        body
      }),
      providesTags: ['Plans'],
    }),
    getPlanDetail: builder.query({
      query: (id) => ({
        url: `/plans/${id}`,
        method: "GET",
      }),
      providesTags: ['Plans'],
    }),
    updatePlan: builder.mutation({
      query: ({ id, body }) => ({
        url: `/plans/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ['Plans'],
    }),
    getUpgradablePlans: builder.query({
      query: ({ userId }) => ({
        url: `/plans/upgradable/${userId}`,
        method: "GET",
      }),
      providesTags: ['Plans'],
    }),
    getAddOnPackages: builder.query({
      query: ({ type, addonType, branchId }) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (addonType) params.append('addonType', addonType);
        if (branchId) params.append('branchId', branchId);
        
        return {
          url: `/plans?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ['Plans'],
    }),
  

  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useAddPlanMutation,useGetPlansQuery,useGetPlanDetailQuery,useUpdatePlanMutation,useGetUpgradablePlansQuery,useGetAddOnPackagesQuery } = plans