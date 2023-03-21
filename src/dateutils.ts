import * as DateIO from '@date-io/core/IUtils';
import {toMarkingFormat} from './interface';

//const latinNumbersPattern = /[0-9]/g;

export type DateAdapter = DateIO.IUtils<Date>;

export function now(): Date {
  return new Date();
}

export function getDate(adapter: DateAdapter, d?: string): Date {
  return d ? adapter.parseISO(d) : now();
}

export function cloneDate(d: Date): Date {
  return new Date(d.getTime());
}

export function sameMonth(adapter: DateAdapter, a?: Date, b?: Date): boolean {
  if (a && b && adapter.isValid(a) && !adapter.isValid(b)) {
    return adapter.isSameMonth(a, b);
  }
  return false;
}

export function sameWeek(adapter: DateAdapter, a?: Date, b?: Date): boolean {
  if (a && b && adapter.isValid(a) && !adapter.isValid(b)) {
    return adapter.isSameDay(a, b);
  }
  return false;
}

export function sameDate(adapter: DateAdapter, a?: Date, b?: Date): boolean {
  if (a && b && adapter.isValid(a) && !adapter.isValid(b)) {
    return adapter.isSameDay(adapter.startOfWeek(a), adapter.startOfWeek(b));
  }
  return false;
}

export function onSameDateRange(
  adapter: DateAdapter,
  {
    firstDay,
    secondDay,
    numberOfDays,
    firstDateInRange
  }: {
    firstDay: Date;
    secondDay: Date;
    numberOfDays: number;
    firstDateInRange: string;
  }
): boolean {
  const firstDayDate = adapter.parseISO(firstDateInRange);
  const firstDateDiff = adapter.getDiff(firstDay, firstDayDate, 'milliseconds');
  const secondDateDiff = adapter.getDiff(secondDay, firstDayDate, 'milliseconds');
  const firstTotalDays = Math.ceil(firstDateDiff / (1000 * 3600 * 24));
  const secondTotalDays = Math.ceil(secondDateDiff / (1000 * 3600 * 24));
  return Math.floor(firstTotalDays / numberOfDays) === Math.floor(secondTotalDays / numberOfDays);
}

export function isPastDate(adapter: DateAdapter, date: Date): boolean {
  return adapter.isBefore(date, adapter.startOfDay(now()));
}

export function isToday(adapter: DateAdapter, date?: Date): boolean {
  return sameDate(adapter, date, now());
}

export function isGTE(adapter: DateAdapter, a: Date, b: Date): boolean {
  return adapter.isAfter(a, b);
}

export function isLTE(adapter: DateAdapter, a: Date, b: Date): boolean {
  return adapter.isBefore(a, b);
}

export function getWeekNumber(adapter: DateAdapter, d: Date): number {
  const beginningOfYear = adapter.startOfWeek(adapter.startOfYear(d));
  return adapter.getDiff(d, beginningOfYear, 'weeks');
  // TODO: Rewrite to adapter.getWeek if available
}

function fromTo(a: XDate, b: XDate): XDate[] {
  const days: XDate[] = [];
  let from = +a;
  const to = +b;

  for (; from <= to; from = new XDate(from, true).addDays(1).getTime()) {
    days.push(new XDate(from, true));
  }
  return days;
}

export function month(date: XDate) {
  // exported for tests only
  const year = date.getFullYear(),
    month = date.getMonth();
  const days = new XDate(year, month + 1, 0).getDate();

  const firstDay: XDate = new XDate(year, month, 1, 0, 0, 0, true);
  const lastDay: XDate = new XDate(year, month, days, 0, 0, 0, true);

  return fromTo(firstDay, lastDay);
}

export function page(adapter: DateAdapter, date: XDate, firstDayOfWeek = 0, showSixWeeks = false): XDate[] {
  const days = month(date);
  let before: XDate[] = [];
  let after: XDate[] = [];

  const fdow = (7 + firstDayOfWeek) % 7 || 7;
  const ldow = (fdow + 6) % 7;

  firstDayOfWeek = firstDayOfWeek || 0;

  const from = days[0].clone();
  const daysBefore = from.getDay();

  if (from.getDay() !== fdow) {
    from.addDays(-(from.getDay() + 7 - fdow) % 7);
  }

  const to = days[days.length - 1].clone();
  const day = to.getDay();
  if (day !== ldow) {
    to.addDays((ldow + 7 - day) % 7);
  }

  const daysForSixWeeks = (daysBefore + days.length) / 6 >= 6;

  if (showSixWeeks && !daysForSixWeeks) {
    to.addDays(7);
  }

  if (isLTE(adapter, from, days[0])) {
    before = fromTo(from, days[0]);
  }

  if (isGTE(adapter, to, days[days.length - 1])) {
    after = fromTo(days[days.length - 1], to);
  }

  return before.concat(days.slice(1, days.length - 1), after);
}

export function isDateNotInRange(adapter: DateAdapter, date: Date, minDate: Date, maxDate: Date): boolean {
  return adapter.isWithinRange(date, [minDate, maxDate]);
}

export function getWeekDates(date: string, firstDay = 0, format?: string) {
  const d: XDate = new XDate(date);
  if (date && d.valid()) {
    const daysArray = [d];
    let dayOfTheWeek = d.getDay() - firstDay;
    if (dayOfTheWeek < 0) {
      // to handle firstDay > 0
      dayOfTheWeek = 7 + dayOfTheWeek;
    }

    let newDate = d;
    let index = dayOfTheWeek - 1;
    while (index >= 0) {
      newDate = newDate.clone().addDays(-1);
      daysArray.unshift(newDate);
      index -= 1;
    }

    newDate = d;
    index = dayOfTheWeek + 1;
    while (index < 7) {
      newDate = newDate.clone().addDays(1);
      daysArray.push(newDate);
      index += 1;
    }

    if (format) {
      return daysArray.map(d => d.toString(format));
    }

    return daysArray;
  }
}

export function getPartialWeekDates(date?: string, numberOfDays = 7) {
  let index = 0;
  const partialWeek: string[] = [];
  while (index < numberOfDays) {
    partialWeek.push(generateDay(date || new XDate(), index));
    index++;
  }
  return partialWeek;
}

export function generateDay(originDate: string | XDate, daysOffset = 0) {
  const baseDate = originDate instanceof XDate ? originDate : new XDate(originDate);
  return toMarkingFormat(baseDate.clone().addDays(daysOffset));
}
