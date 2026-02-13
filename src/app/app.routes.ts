import { Routes } from '@angular/router';

export const routes: Routes = [
  {
        path: '',
        loadComponent: () =>
          import('./features/pages/home/home.component')
            .then(m => m.HomeComponent)
      },
      {
        path: 'tienda',
        loadComponent: () =>
          import('./features/pages/store/store.component')
            .then(m => m.StoreComponent)
      },
      {
        path: 'carrito',
        loadComponent: () =>
          import('./features/pages/cart/cart.component')
            .then(m => m.CartComponent)
      },
      {
        path: 'ubicaciones',
        loadComponent: () =>
          import('./features/pages/locations/location.component')
            .then(m => m.LocationComponent)
      },
      {
        path: 'login-register',
        loadComponent: () =>
          import('./features/pages/auth/auth.component')
            .then(m => m.AuthComponent)
      },
      {
        path: 'user',
        loadComponent: () =>
          import('./features/pages/user/user.component')
            .then(m => m.UserComponent)
      },
];
