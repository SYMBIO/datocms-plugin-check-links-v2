import React from 'react';
import PropTypes from 'prop-types';

const StaffRowArtists = ({ staff, selected, setSelected }) => (
  <>
    <li
      key={`artist_dropzone_${staff.id}`}
      className="dropzone"
      id={`dropzone_${staff.id}`}
    />
    <li key={`artist_${staff.id}`} className="draggable">
      <label>
        <input
          type="checkbox"
          checked={selected.indexOf(staff.id) !== -1}
          onChange={() => {
            if (selected.indexOf(staff.id) !== -1) {
              const newSelected = selected.filter(r => r !== staff.id);
              setSelected(newSelected);
            } else {
              setSelected([...selected, staff.id]);
            }
          }}
        />
        {staff.artist.firstName} {staff.artist.name}
      </label>
    </li>
  </>
);

StaffRowArtists.propTypes = {
  staff: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    artist: PropTypes.shape({
      firstName: PropTypes.string,
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  setSelected: PropTypes.func.isRequired,
};

export default StaffRowArtists;
