import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const generalStaffApi = createApi({
  reducerPath: 'generalStaffApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['GeneralStaff'],
  endpoints: (builder) => ({
    getGeneralStaff: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/general-staff?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['GeneralStaff'],
    }),
    getGeneralStaffDetail: builder.query({
      query: (id) => ({
        url: `/general-staff/${id}`,
        method: 'GET',
      }),
    }),
    addGeneralStaff: builder.mutation({
      query: (body) => ({
        url: '/general-staff',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GeneralStaff'],
    }),
    staffType: builder.query({
      query: (body) => ({
        url: '/staff-types',
        method: 'GET',
        body,
      }),
    }),
  }),
});

export const { useGetGeneralStaffQuery, useAddGeneralStaffMutation, useStaffTypeQuery, useGetGeneralStaffDetailQuery } = generalStaffApi;
