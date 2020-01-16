import React, { Component } from 'react';
import PropTypes from 'prop-types';

import connectToDatoCms from './connectToDatoCms';
import './style.css';

@connectToDatoCms(plugin => ({
  token: plugin.parameters.global.datoCmsApiToken,
  itemId: plugin.itemId,
  fieldPath: plugin.fieldPath,
  setFieldValue: plugin.setFieldValue,
  getFieldValue: plugin.getFieldValue,
  productionId: plugin.getFieldValue('production'),
}))
class Main extends Component {
  constructor(props) {
    super();
    this.state = {
      loading: true,
      data: {},
      selected: props.getFieldValue(props.fieldPath),
    };
  }

  componentDidMount() {
    const { fieldPath } = this.props;

    if (fieldPath.substr(0, 5) === 'roles') {
      this.loadRolesData();
    }

    if (fieldPath.substr(0, 5) === 'staff') {
      this.loadStaffData();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { selected } = this.state;
    if (selected !== prevState.selected) {
      const { setFieldValue, fieldPath } = this.props;
      setFieldValue(fieldPath, selected);
    }
  }

  getArtistsRoleRow(role) {
    const { selected } = this.state;

    return (
      <li key={`artist_${role.id}`}>
        <label>
          <input
            type="checkbox"
            checked={selected.indexOf(role.id) !== -1}
            onChange={() => {
              if (selected.indexOf(role.id) !== -1) {
                const newSelected = selected.filter(r => r !== role.id);
                this.setState({ selected: newSelected });
              } else {
                this.setState({ selected: [...selected, role.id] });
              }
            }}
          />
          {role.artist.firstName} {role.artist.name}
        </label>
      </li>
    );
  }

  getRoleRow(role) {
    const {
      data: { roles },
    } = this.state;
    const productionRoles = roles.filter(r => r.role.id === role.id);
    const artistsRows = productionRoles.map(r => this.getArtistsRoleRow(r));

    if (artistsRows.length === 0) {
      return <></>;
    }

    return (
      <li key={`title_role${role.id}`}>
        <h3>{role.name}</h3>
        <ul>{artistsRows}</ul>
      </li>
    );
  }

  getArtistsStaffRow(staff) {
    const { selected } = this.state;

    return (
      <li key={`artist_${staff.id}`}>
        <label>
          <input
            type="checkbox"
            checked={selected.indexOf(staff.id) !== -1}
            onChange={() => {
              if (selected.indexOf(staff.id) !== -1) {
                const newSelected = selected.filter(s => s !== staff.id);
                this.setState({ selected: newSelected });
              } else {
                this.setState({ selected: [...selected, staff.id] });
              }
            }}
          />
          {staff.artist.firstName} {staff.artist.name}
        </label>
      </li>
    );
  }

  getStaffRow(staf) {
    const {
      data: { staff },
    } = this.state;
    const productionStaff = staff.filter(s => s.staff.id === staf.id);
    const artistsRows = productionStaff.map(s => this.getArtistsStaffRow(s));

    if (artistsRows.length === 0) {
      return <></>;
    }

    return (
      <li key={`title_role${staf.id}`}>
        <h3>{staf.field.title}</h3>
        <ul>{artistsRows}</ul>
      </li>
    );
  }

  loadRolesData() {
    const { token, productionId } = this.props;

    this.setState({
      loading: true,
    });

    fetch('https://graphql.datocms.com/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `{
          production(filter: {id: {eq: "${productionId}"}}) {
            titles {
              id
              title
              roles {
                id
                name
              }
            }
            roles {
              id
              role {
                id
              }
              artist{
                firstName
                name
              }
            }
          }
        }
        `,
      }),
    })
      .then(res => res.json())
      .then(res => {
        this.setState({
          loading: false,
          data: res.data.production,
        });
      })
      .catch(error => {
        this.setState({
          loading: false,
        });
        console.log(error);
      });
  }

  loadStaffData() {
    const { token, productionId } = this.props;

    this.setState({
      loading: true,
    });

    fetch('https://graphql.datocms.com/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `{
          production(filter: {id: {eq: "${productionId}"}}) {
            id
            titles {
              id
              title
              staff {
                id
                field {
                  title
                }
              }
            }
            staff {
              id
              staff {
                id
              }
              artist{
                firstName
                name
              }
            }
          }
        }
          `,
      }),
    })
      .then(res => res.json())
      .then(res => {
        this.setState({
          loading: false,
          data: res.data.production,
        });
      })
      .catch(error => {
        this.setState({
          loading: false,
        });
        console.log(error);
      });
  }

  render() {
    const { loading, data } = this.state;
    const { fieldPath } = this.props;

    if (loading) {
      return <div className="container">Načítám data...</div>;
    }

    if (fieldPath.substr(0, 5) === 'roles') {
      return (
        <div className="container">
          <ul>
            {data.titles.map(title => (
              <li key={`title_${title.id}`}>
                <div>
                  <h2>Titul: {title.title}</h2>
                  <button
                    type="button"
                    onClick={() =>
                      this.setState({ selected: data.roles.map(r => r.id) })
                    }
                  >
                    Zaškrtnout vše
                  </button>
                  <button
                    type="button"
                    onClick={() => this.setState({ selected: [] })}
                  >
                    Odškrtnout vše
                  </button>
                </div>
                <ul>{title.roles.map(role => this.getRoleRow(role))}</ul>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (fieldPath.substr(0, 5) === 'staff') {
      return (
        <div className="container">
          <ul>
            {data.titles.map(title => (
              <li key={`title_${title.id}`}>
                <div>
                  <h2>Titul: {title.title}</h2>
                  <button
                    type="button"
                    onClick={() =>
                      this.setState({ selected: data.staff.map(s => s.id) })
                    }
                  >
                    Zaškrtnout vše
                  </button>
                  <button
                    type="button"
                    onClick={() => this.setState({ selected: [] })}
                  >
                    Odškrtnout vše
                  </button>
                </div>
                {title && title.staff && (
                  <ul>{title.staff.map(staff => this.getStaffRow(staff))}</ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return <span>Bad field!</span>;
  }
}

Main.propTypes = {
  token: PropTypes.string,
  fieldPath: PropTypes.string,
  setFieldValue: PropTypes.func,
  getFieldValue: PropTypes.func,
  productionId: PropTypes.string,
};

export default Main;
