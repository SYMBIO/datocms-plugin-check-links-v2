import moment from 'moment';

export default function itemIsValid(item, startAt) {
  const start = moment(startAt);
  return (
    (!item.dateFrom || moment(item.dateFrom).isBefore(start)) &&
    (!item.dateTo ||
      moment(item.dateTo)
        .endOf('day')
        .isAfter(start))
  );
}
