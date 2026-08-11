import { getDefaultDateRange } from './getDefaultDateRange';

export interface BaseSearchRequest {
  pageIndex?: number;
  pageSize?: number;
  searchField?: Record<string, any>;
  cdateStart?: string;
  cdateEnd?: string;
}

export function buildBaseBody(params: BaseSearchRequest = {}) {
  const defaultDates = getDefaultDateRange();
  const body: Record<string, any> = {
    SearchField: params.searchField || {},
    CDATE_START: params.cdateStart || defaultDates.cdateStart,
    CDATE_END: params.cdateEnd || defaultDates.cdateEnd,
  };

  if (params.pageSize) {
    body.PageSize = params.pageSize;
  }
  if (params.pageIndex) {
    body.PageIndex = params.pageIndex;
  }

  return body;
}
