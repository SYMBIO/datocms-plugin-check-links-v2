import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import itemIsValid from './itemIsValid';
import StaffRowArtists from './StaffRowArtists';

const StaffRow = ({ staff, staffs, selected, setState, startAt }) => {
  const productionStaffs = staffs.filter(
    s => s.staff.id === staff.id && itemIsValid(s, startAt),
  );

  const artistsRows = productionStaffs
    .map(r =>
      (selected.indexOf(staff.id) !== -1 ? (
        <StaffRowArtists Staff={r} selected={selected} setState={setState} />
      ) : null),
    )
    .filter(s => s);

  artistsRows.push(
    ...productionStaffs
      .map(r =>
        (selected.indexOf(staff.id) === -1 ? (
          <StaffRowArtists Staff={r} selected={selected} setState={setState} />
        ) : null),
      )
      .filter(s => s),
  );

  useEffect(() => {
    console.log(staff);
  }, [staff, staffs]);

  if (artistsRows.length === 0) {
    return <></>;
  }

  return (
    <li key={`title_Staff${staff.id}`}>
      <h3>{staff.name}</h3>
      <ul>{artistsRows}</ul>
    </li>
  );
};

StaffRow.propTypes = {
  staff: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  staffs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  setState: PropTypes.func.isRequired,
  startAt: PropTypes.string.isRequired,
};

export default StaffRow;
