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
import { coupons } from '../coupons'
import { feedbacks } from '../feedbacks'
import { qrCodes } from '../qrCodes'
import { departments } from '../departments'
import { biometricApi } from '../biometric'
import { inventoryApi } from '../inventory'
import { invoiceApi } from '../invoice'
import { uplineApi } from '../upline'
import branchReducer from '../branchSlice'

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [user.reducerPath]: user.reducer,
    [coupons.reducerPath]: coupons.reducer,
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
    [feedbacks.reducerPath]: feedbacks.reducer,
    [qrCodes.reducerPath]: qrCodes.reducer,
    [departments.reducerPath]: departments.reducer,
    [biometricApi.reducerPath]: biometricApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
    [invoiceApi.reducerPath]: invoiceApi.reducer,
    [uplineApi.reducerPath]: uplineApi.reducer,
    branch: branchReducer,
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
    coupons.middleware,
    feedbacks.middleware,
    qrCodes.middleware,
    departments.middleware,
    biometricApi.middleware,
    inventoryApi.middleware,
    invoiceApi.middleware,
    uplineApi.middleware,
  ),
})

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch)