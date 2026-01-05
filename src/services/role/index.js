// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import {dynamicBaseQuery} from "../badRequestHandler"
// Define a service using a base URL and expected endpoints
export const roles = createApi({
  reducerPath: 'roles',
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => ({
        url: `/roles`,
        method: "GET",
   
      }),
    }),
    addRole: builder.mutation({
      query: (payload) => ({
        url: `/roles`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ['Roles'],
    }),
    updateRole: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/roles/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ['Roles'],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Roles'],
    }),
  }),
  tagTypes: ['Roles'],
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetRolesQuery, useAddRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } = roles