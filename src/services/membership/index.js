
// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import { dynamicBaseQuery } from "../badRequestHandler"

// Define a service using a base URL and expected endpoints
export const membership = createApi({
  reducerPath: 'membership',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Membership'],
  endpoints: (builder) => ({
    getUserMembership: builder.query({
      query: (userId) => ({
        url: `/memberships/user/${userId}`,
        method: "GET",
      }),
      providesTags: ['Membership'],
    }),
    getUserAddOns: builder.query({
      query: (userId) => ({
        url: `/memberships/user/${userId}/addons`,
        method: "GET",
      }),
      providesTags: ['Membership'],
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetUserMembershipQuery, useGetUserAddOnsQuery } = membership
