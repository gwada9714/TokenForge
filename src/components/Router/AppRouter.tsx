import { useRoutes } from 'react-router-dom';
import { routes } from '../../config/routerConfig';

const AppRouter = () => {
  return useRoutes(routes);
};

export default AppRouter;
