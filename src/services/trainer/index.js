// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import {dynamicBaseQuery} from "../badRequestHandler"

// Define a service using a base URL and expected endpoints
export const trainer = createApi({
  reducerPath: 'trainer',
  baseQuery: dynamicBaseQuery,
  tagTypes:["Trainers"],
  endpoints: (builder) => ({
    getTrainers: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/trainers?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ['Trainers'],
    }),
    getTrainersDetail: builder.query({
      query: (id) => ({
        url: `/trainers/${id}`,
        method: "GET",
      }),
      providesTags: ['Trainers'],
    }),
    addTrainers: builder.mutation({
      query: (newTrainer) => ({
        url: `/trainers`,
        method: "POST",
        body: newTrainer,
      }),
      invalidatesTags: ['Trainers'],
    }),
  }),
})

export const { useGetTrainersQuery, useAddTrainersMutation,useGetTrainersDetailQuery } = trainer