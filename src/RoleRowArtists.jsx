import React from 'react';
import PropTypes from 'prop-types';

const RoleRowArtists = ({ role, selected, setSelected }) => (
  <>
    <li
      key={`artist_dropzone_${role.id}`}
      className="dropzone"
      id={`dropzone_${role.id}`}
      data-role={JSON.stringify(role)}
    />
    <li key={`artist_${role.id}`} className="draggable">
      <label>
        <input
          type="checkbox"
          checked={selected.indexOf(role.id) !== -1}
          onChange={() => {
            if (selected.indexOf(role.id) !== -1) {
              const newSelected = selected.filter(r => r !== role.id);
              setSelected(newSelected);
            } else {
              setSelected([...selected, role.id]);
            }
          }}
        />
        {role.artist.firstName} {role.artist.name}
      </label>
    </li>
  </>
);

RoleRowArtists.propTypes = {
  role: PropTypes.shape({
    id: PropTypes.string.isRequired,
    artist: PropTypes.shape({
      firstName: PropTypes.string,
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  setSelected: PropTypes.func.isRequired,
};

export default RoleRowArtists;
