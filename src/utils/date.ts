import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function formatDate(value: number | null) {
  return value ? dayjs(value).format('MMM D, YYYY') : '';
}

export function formatDateTime(value: number | null) {
  return value ? dayjs(value).format('MMM D, YYYY [at] h:mm A') : '';
}

export function fromNow(value: number | null) {
  return value ? dayjs(value).fromNow() : '';
}

export function isOverdue(dueAt: number | null, completed: boolean) {
  return !completed && dueAt !== null && dayjs(dueAt).isBefore(dayjs());
}
