import React from 'react';
import PropTypes from 'prop-types';

const StaffRowArtists = ({ Staff, selected, setState }) => (
  <li key={`artist_${Staff.id}`}>
    <label>
      <input
        type="checkbox"
        checked={selected.indexOf(Staff.id) !== -1}
        onChange={() => {
          if (selected.indexOf(Staff.id) !== -1) {
            const newSelected = selected.filter(r => r !== Staff.id);
            setState({ selected: newSelected });
          } else {
            setState({ selected: [...selected, Staff.id] });
          }
        }}
      />
      {Staff.artist.firstName} {Staff.artist.name}
    </label>
  </li>
);

StaffRowArtists.propTypes = {
  Staff: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    artist: PropTypes.shape({
      firstName: PropTypes.string,
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  setState: PropTypes.func.isRequired,
};

export default StaffRowArtists;
