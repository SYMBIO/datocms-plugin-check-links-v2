import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import itemIsValid from './itemIsValid';
import RoleRowArtists from './RoleRowArtists';

const RoleRow = ({ role, roles, selected, setState }) => {
  const productionRoles = roles.filter(
    r => r.role.id === role.id && itemIsValid(r),
  );

  const artistsRows = productionRoles
    .map(r =>
      (selected.indexOf(role.id) !== -1 ? (
        <RoleRowArtists role={r} selected={selected} setState={setState} />
      ) : null),
    )
    .filter(r => r);
  artistsRows.push(
    ...productionRoles
      .map(r =>
        (selected.indexOf(role.id) === -1 ? (
          <RoleRowArtists role={r} selected={selected} setState={setState} />
        ) : null),
      )
      .filter(r => r),
  );

  useEffect(() => {
    console.log(role, roles);
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
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  setState: PropTypes.func.isRequired,
};

export default RoleRow;
