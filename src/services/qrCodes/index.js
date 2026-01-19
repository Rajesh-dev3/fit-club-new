import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '../badRequestHandler';

export const qrCodes = createApi({
  reducerPath: 'qrCodes',
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    generateQrCode: builder.mutation({
      query: (branchId) => ({
        url: '/qr-codes/generate',
        method: 'POST',
        body: { branchId },
      }),
    }),
  }),
});

export const { useGenerateQrCodeMutation } = qrCodes;
