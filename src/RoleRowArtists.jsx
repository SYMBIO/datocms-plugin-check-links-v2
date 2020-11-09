import React from 'react';
import PropTypes from 'prop-types';

const RoleRowArtists = ({ role, selected, setState }) => (
  <li key={`artist_${role.id}`}>
    <label>
      <input
        type="checkbox"
        checked={selected.indexOf(role.id) !== -1}
        onChange={() => {
          if (selected.indexOf(role.id) !== -1) {
            const newSelected = selected.filter(r => r !== role.id);
            setState({ selected: newSelected });
          } else {
            setState({ selected: [...selected, role.id] });
          }
        }}
      />
      {role.artist.firstName} {role.artist.name}
    </label>
  </li>
);

RoleRowArtists.propTypes = {
  role: PropTypes.shape({
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

export default RoleRowArtists;
