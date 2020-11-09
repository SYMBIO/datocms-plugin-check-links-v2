import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import itemIsValid from './itemIsValid';
import RoleRowArtists from './RoleRowArtists';

const RoleRow = ({ role, roles, selected, setSelected, startAt }) => {
  const productionRoles = roles.filter(
    r => r.role.id === role.id && itemIsValid(r, startAt),
  );

  const artistsRows = productionRoles
    .map(r =>
      selected.indexOf(r.id) !== -1 ? (
        <RoleRowArtists
          role={r}
          selected={selected}
          setSelected={setSelected}
        />
      ) : null,
    )
    .filter(r => r);
  artistsRows.push(
    ...productionRoles
      .map(r =>
        selected.indexOf(r.id) === -1 ? (
          <RoleRowArtists
            role={r}
            selected={selected}
            setSelected={setSelected}
          />
        ) : null,
      )
      .filter(r => r),
  );

  useEffect(() => {
    // console.log(role, productionRoles);
  }, [role, roles]);

  if (artistsRows.length === 0) {
    return <></>;
  }

  return (
    <li key={`title_role${role.id}`} className={`RoleRow_${role.id}`}>
      <h3>{role.name}</h3>
      <ul>{artistsRows}</ul>
    </li>
  );
};

RoleRow.propTypes = {
  role: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  roles: PropTypes.arrayOf(
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

export default RoleRow;
