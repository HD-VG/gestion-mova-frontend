import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  // Por ahora dejamos pasar a todos
  return true;
};
