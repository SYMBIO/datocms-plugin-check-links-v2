import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import itemIsValid from './itemIsValid';
import StaffRowArtists from './StaffRowArtists';

const StaffRow = ({ staff, staffs, selected, setSelected, startAt }) => {
  const productionStaffs = staffs.filter(
    s => s.staff.id === staff.id && itemIsValid(s, startAt),
  );

  const artistsRows = [];

  // first add selected artist (in the order of selection)
  selected.forEach(sel => {
    const s = productionStaffs.find(ps => ps.id === sel);
    if (s) {
      artistsRows.push(
        <StaffRowArtists
          staff={s}
          selected={selected}
          setSelected={setSelected}
        />,
      );
    }
  });

  // add others (non-selected) artists
  artistsRows.push(
    ...productionStaffs
      .map(s =>
        selected.indexOf(s.id) === -1 && s ? (
          <StaffRowArtists
            staff={s}
            selected={selected}
            setSelected={setSelected}
          />
        ) : null,
      )
      .filter(s => s),
  );

  useEffect(() => {
    // console.log(staff);
  }, [staff, staffs]);

  if (artistsRows.length === 0) {
    return <></>;
  }

  return (
    <li key={`title_Staff${staff.id}`}>
      <h3>{staff.field.title}</h3>
      <ul>
        {artistsRows}
      </ul>
    </li>
  );
};

StaffRow.propTypes = {
  staff: PropTypes.shape({
    id: PropTypes.string.isRequired,
    field: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }),
  }).isRequired,
  staffs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      artist: PropTypes.shape({
        firstName: PropTypes.string,
        name: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  setSelected: PropTypes.func.isRequired,
  startAt: PropTypes.string.isRequired,
};

export default StaffRow;
