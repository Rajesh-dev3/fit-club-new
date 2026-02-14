// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import {dynamicBaseQuery} from "../badRequestHandler"
// Define a service using a base URL and expected endpoints
export const employee = createApi({
  reducerPath: 'employee',
  tagTypes: ['Employee'],
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    addEmployee: builder.mutation({
      query: (body) => ({
        url: `/employees`,
        method: "POST",
        body,
      }),
      invalidatesTags: ['Employee'],
    }),
    getEmployee: builder.query({
      query: (body) => ({
        url: `/employees`,
        method: "GET",
        body,
      }),
      providesTags: ['Employee'],
    }),
    getEmployeeDetail: builder.query({
      query: (id) => ({
        url: `/employees/${id}`,
        method: "GET",
      }),
      providesTags: ['Employee'],
    }),
    getEmployeeByCustomer: builder.query({
      query: (id) => ({
        url: `/employees/by-customer?userId=${id}`,
        method: "GET",
      }),
      providesTags: ['Employee'],
    }),
  
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useAddEmployeeMutation,useGetEmployeeQuery,useGetEmployeeDetailQuery,useGetEmployeeByCustomerQuery } = employee