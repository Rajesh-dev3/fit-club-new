import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Public Rest Countries API wrapper
export const countries = createApi({
  reducerPath: 'countries',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://restcountries.com/v3.1/' }),
  endpoints: (builder) => ({
    getAll: builder.query({
      // returns array of country objects
      query: () => 'all?fields=name,flags,idd,cca2',
    }),
  }),
})

export const { useGetAllQuery: useGetCountriesQuery } = countries
