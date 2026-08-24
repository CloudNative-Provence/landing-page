import { I18N } from 'astrowind:config';

export const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(I18N?.language, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export const getFormattedDate = (date: Date): string => (date ? formatter.format(date) : '');

export const toUiAmount = (amount: number) => {
  if (!amount) return 0;

  let value: string;

  if (amount >= 1000000000) {
    const formattedNumber = (amount / 1000000000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'B';
    } else {
      value = formattedNumber + 'B';
    }
  } else if (amount >= 1000000) {
    const formattedNumber = (amount / 1000000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'M';
    } else {
      value = formattedNumber + 'M';
    }
  } else if (amount >= 1000) {
    const formattedNumber = (amount / 1000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'K';
    } else {
      value = formattedNumber + 'K';
    }
  } else {
    value = Number(amount).toFixed(0);
  }

  return value;
};
