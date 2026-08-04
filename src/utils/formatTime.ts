import { getTime, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

type InputValue = Date | string | number | null | undefined;

/**
 * Kiểm tra xem dữ liệu thời gian truyền vào có bao gồm phần giờ hay không
 */
function hasTimeComponent(date: InputValue): boolean {
  if (!date) return false;

  if (typeof date === 'number') {
    return true;
  }

  if (date instanceof Date) {
    return date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0;
  }

  if (typeof date === 'string') {
    const trimmed = date.trim();
    if (trimmed.includes(':') || (trimmed.includes('T') && trimmed.length > 10)) {
      return true;
    }
  }

  return false;
}

/**
 * Chuyển đổi và định dạng thời gian về giờ +7 (Asia/Ho_Chi_Minh)
 * - Nếu có giờ: HH:mm:ss dd/MM/yyyy
 * - Nếu chỉ có ngày: dd/MM/yyyy
 */
export function formatTime(date: InputValue, customFormat?: string): string {
  if (!date) return '';

  let d: Date;
  if (typeof date === 'number') {
    // Nếu timestamp dạng 10 chữ số (giây) -> nhân 1000 sang mili giây
    d = new Date(date < 10000000000 ? date * 1000 : date);
  } else if (typeof date === 'string') {
    const trimmed = date.trim();
    const isOnlyDate = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
    if (isOnlyDate) {
      d = new Date(`${trimmed}T00:00:00+07:00`);
    } else {
      d = new Date(trimmed);
    }
  } else {
    d = date;
  }

  if (isNaN(d.getTime())) return String(date);

  // Định dạng theo múi giờ GMT+7 (Asia/Ho_Chi_Minh)
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';

  const day = getPart('day');
  const month = getPart('month');
  const year = getPart('year');
  let hour = getPart('hour');
  if (hour === '24') hour = '00';
  const minute = getPart('minute');
  const second = getPart('second');

  if (customFormat) {
    return customFormat
      .replace(/yyyy/g, year)
      .replace(/MM/g, month)
      .replace(/dd/g, day)
      .replace(/HH/g, hour)
      .replace(/hh/g, hour)
      .replace(/mm/g, minute)
      .replace(/ss/g, second);
  }

  if (hasTimeComponent(date)) {
    return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
  }

  return `${day}/${month}/${year}`;
}

export function fDate(date: InputValue, newFormat?: string) {
  return formatTime(date, newFormat);
}

export function fDateTime(date: InputValue, newFormat?: string) {
  return formatTime(date, newFormat);
}

export function fTimestamp(date: InputValue) {
  if (!date) return '';
  const d = typeof date === 'number' ? new Date(date) : new Date(date);
  return isNaN(d.getTime()) ? '' : getTime(d);
}

export function fToNow(date: InputValue) {
  if (!date) return '';
  const d = new Date(date);
  return isNaN(d.getTime())
    ? ''
    : formatDistanceToNow(d, {
        addSuffix: true,
      });
}

export default formatTime;
