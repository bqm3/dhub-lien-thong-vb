import { NavListProps, NavSectionProps } from '../../../components/nav-section/types';
import { hasPermissions } from '../../../auth/permissions';

function filterItem(item: NavListProps, userPermissions: string[] | undefined | null): NavListProps | null {
  const allowed = hasPermissions({
    userPermissions,
    required: item.permissions,
    mode: item.permissionMode ?? 'any',
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
  userPermissions: string[] | undefined | null
): NavSectionProps['data'] {
  return navConfig
    .map((group) => {
      const items = group.items
        .map((item) => filterItem(item, userPermissions))
        .filter(Boolean) as NavListProps[];
      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);
}

