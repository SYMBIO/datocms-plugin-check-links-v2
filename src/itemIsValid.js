import moment from 'moment';

export default function itemIsValid(item) {
  const { getFieldValue } = this.props;
  const start = moment(getFieldValue('start_at'));
  return (
    (!item.dateFrom || moment(item.dateFrom).isBefore(start)) &&
    (!item.dateTo ||
      moment(item.dateTo)
        .endOf('day')
        .isAfter(start))
  );
}
