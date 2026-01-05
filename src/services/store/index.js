import { configureStore } from '@reduxjs/toolkit'
// Or from '@reduxjs/toolkit/query/react'
import { setupListeners } from '@reduxjs/toolkit/query'
import { user } from '../user'
import { countries } from '../countries'
import { branches } from '../branches'
import { imageService } from '../imageService'
import { roles } from '../role'
import { permissions } from '../permissions'
import { auth } from '../auth'
import { trainer } from '../trainer'
import { employee } from '../employee'
import { generalStaffApi } from '../generalStaff'
import { plans } from '../package'
import { director } from '../director'

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [user.reducerPath]: user.reducer,
    [countries.reducerPath]: countries.reducer,
    [branches.reducerPath]: branches.reducer,
    [imageService.reducerPath]: imageService.reducer,
    [roles.reducerPath]: roles.reducer,
    [permissions.reducerPath]: permissions.reducer,
    [auth.reducerPath]: auth.reducer,
    [trainer.reducerPath]: trainer.reducer,
    [employee.reducerPath]: employee.reducer,
    [generalStaffApi.reducerPath]: generalStaffApi.reducer,
    [plans.reducerPath]: plans.reducer,
    [director.reducerPath]: director.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
  .concat(user.middleware, countries.middleware,
     branches.middleware,
     imageService.middleware,
     roles.middleware,
     permissions.middleware,
     auth.middleware,
     trainer.middleware,
     employee.middleware,
     generalStaffApi.middleware,
    plans.middleware,
    director.middleware,
  ),
})

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch)