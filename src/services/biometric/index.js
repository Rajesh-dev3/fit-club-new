import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const biometricApi = createApi({
  reducerPath: 'biometricApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Biometric'],
  endpoints: (builder) => ({
    getBiometrics: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/machines?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Biometric'],
    }),
    getBiometricById: builder.query({
      query: (id) => ({
        url: `/machines/${id}`,
        method: 'GET',
      }),
    }),
    addBiometric: builder.mutation({
      query: (body) => ({
        url: '/machines',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Biometric'],
    }),
    updateBiometric: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/machines/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Biometric'],
    }),
    updateBiometricLimited: builder.mutation({
      query: ({ id, floor, recordPurpose }) => ({
        url: `/machines/${id}`,
        method: 'PUT',
        body: {
          floor,
          recordPurpose,
        },
      }),
      invalidatesTags: ['Biometric'],
    }),
    deleteBiometric: builder.mutation({
      query: (id) => ({
        url: `/machines/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Biometric'],
    }),
    updateBiometricStatus: builder.mutation({
      query: (id) => ({
        url: `/machines/toggle-status/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Biometric'],
    }),
    getBranchResources: builder.query({
      query: (branchIds) => {
        if (Array.isArray(branchIds) && branchIds.length > 0) {
          const branchIdString = branchIds.join(',');
          return `/branch-resources?branchIds=${branchIdString}`;
        } else if (branchIds) {
          return `/branch-resources?branchIds=${branchIds}`;
        }
        return '/branch-resources';
      },
      providesTags: ['Biometric'],
    }),
  }),
});

export const {
  useGetBiometricsQuery,
  useGetBiometricByIdQuery,
  useAddBiometricMutation,
  useUpdateBiometricMutation,
  useUpdateBiometricLimitedMutation,
  useDeleteBiometricMutation,
  useUpdateBiometricStatusMutation,
  useGetBranchResourcesQuery,
} = biometricApi;