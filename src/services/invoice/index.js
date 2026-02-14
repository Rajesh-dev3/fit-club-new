import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const invoiceApi = createApi({
  reducerPath: 'invoiceApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Invoice'],
  endpoints: (builder) => ({
    getInvoices: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/invoices?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Invoice'],
    }),
    getInvoiceById: builder.query({
      query: (id) => ({
        url: `/invoices/${id}`,
        method: 'GET',
      }),
    }),
    addInvoice: builder.mutation({
      query: (body) => ({
        url: '/invoices/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Invoice'],
    }),
    updateInvoice: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/invoices/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Invoice'],
    }),
    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `/invoices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Invoice'],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useAddInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
} = invoiceApi;