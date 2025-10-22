import { AuthStoreService } from '../../services/auth-store.service';
import { serviceRegistry } from '../../services/service-registry';

export const AuthHelpers = {
  getStoredAuthData: (): any => {
    const authStoreService: AuthStoreService = serviceRegistry.get(AuthStoreService);

    return authStoreService.getAuthData();
  },

  isLoggedIn: (): boolean => {
    const storedAuthData = AuthHelpers.getStoredAuthData();
    const isAuthValid = () => storedAuthData.accessTokenExpirationDate > Number(new Date());

    return storedAuthData && isAuthValid();
  }
};
