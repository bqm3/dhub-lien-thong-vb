import { useLocation, matchPath } from 'react-router-dom';

// ----------------------------------------------------------------------

type ReturnType = {
  active: boolean;
  isExternalLink: boolean;
};

export default function useActiveLink(
  path: string,
  deep = true,
  childPaths: string[] = []
): ReturnType {
  const { pathname } = useLocation();

  const normalActive = path ? !!matchPath({ path, end: true }, pathname) : false;

  const deepActive = path ? !!matchPath({ path, end: false }, pathname) : false;

  const childActive = childPaths.some(
    (childPath) =>
      !!matchPath({ path: childPath, end: true }, pathname) ||
      !!matchPath({ path: childPath, end: false }, pathname)
  );

  return {
    active: (deep ? deepActive : normalActive) || childActive,
    isExternalLink: path.includes('http'),
  };
}
