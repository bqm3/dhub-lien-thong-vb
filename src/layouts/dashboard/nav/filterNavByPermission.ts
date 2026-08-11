import { NavListProps, NavSectionProps } from '../../../components/nav-section/types';
import { hasPermissions, PATH_PERMISSIONS } from '../../../auth/permissions';
import { PATH_DASHBOARD } from '../../../routes/paths';

function filterItem(item: NavListProps, userPermissions: string[] | undefined | null): NavListProps | null {
  // Auto lookup permissions for this path from the central configuration
  const required = PATH_PERMISSIONS[item.path];
  
  const allowed = hasPermissions({
    userPermissions,
    required,
    mode: 'any',
  });

  if (!allowed) return null;

  if (!item.children) return item;

  const children = (item.children as NavListProps[])
    .map((child) => filterItem(child, userPermissions))
    .filter(Boolean) as NavListProps[];

  // If a parent is just a group and has no visible children, hide it.
  if (children.length === 0) return null;

  return { ...item, children };
}

export default function filterNavByPermission(
  navConfig: NavSectionProps['data'],
  userPermissions: string[] | undefined | null,
  user?: any
): NavSectionProps['data'] {
  const isSystemAdmin = Boolean(user?.isSystemAdmin);

  return navConfig
    .map((group) => {
      const items = group.items
        .filter((item) => {
          if (isSystemAdmin) {
            if (item.path === PATH_DASHBOARD.exchangeOutgoing || item.path === PATH_DASHBOARD.exchangeIncoming) {
              return false;
            }
          } else {
            if (item.path === PATH_DASHBOARD.exchange) {
              return false;
            }
          }
          return true;
        })
        .map((item) => filterItem(item, userPermissions))
        .filter(Boolean) as NavListProps[];
      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);
}

