import {DateAdapter} from './dateutils';
import {DateData} from './types';

export function getDateData(adapter: DateAdapter, date: Date): DateData {
  const dateString = toMarkingFormat(adapter, date);
  return {
    year: adapter.getYear(date),
    month: adapter.getMonth(date),
    day: adapter.getDate(date),
    timestamp: date.getTime(),
    dateString: dateString
  };
}

export function toMarkingFormat(adapter: DateAdapter, d: Date): string {
  return adapter.toISO(d);
}
