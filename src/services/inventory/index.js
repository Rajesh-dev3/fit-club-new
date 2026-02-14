import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery:dynamicBaseQuery,
  tagTypes: ['Inventory'],
  endpoints: (builder) => ({
    createInventory: builder.mutation({
      query: (inventoryData) => ({
        url: '/inventory',
        method: 'POST',
        body: inventoryData,
      }),
      invalidatesTags: ['Inventory'],
    }),
    getInventory: builder.query({
      query: () => '/inventory',
      providesTags: ['Inventory'],
    }),
    getGymKitInventory: builder.query({
      query: (branchIds) => {
        if (Array.isArray(branchIds) && branchIds.length > 0) {
          const branchIdString = branchIds.join(',');
          return `/inventory/by-branches?branchIds=${branchIdString}`;
        } else if (branchIds) {
          return `/inventory/by-branches?branchIds=${branchIds}`;
        }
        return '/inventory/by-branches?branchIds';
      },
      providesTags: ['Inventory'],
    }),
    updateInventory: builder.mutation({
      query: ({ id, ...inventoryData }) => ({
        url: `/inventory/${id}`,
        method: 'PUT',
        body: inventoryData,
      }),
      invalidatesTags: ['Inventory'],
    }),
    deleteInventory: builder.mutation({
      query: (id) => ({
        url: `/inventory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Inventory'],
    }),
    toggleInventoryStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/inventory/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
});

export const {
  useCreateInventoryMutation,
  useGetInventoryQuery,
  useGetGymKitInventoryQuery,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
  useToggleInventoryStatusMutation,
} = inventoryApi;