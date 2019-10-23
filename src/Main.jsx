import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SiteClient } from 'datocms-client';

import connectToDatoCms from './connectToDatoCms';
import './style.css';

@connectToDatoCms(plugin => ({
  token: plugin.parameters.global.datoCmsApiToken,
  itemId: plugin.itemId,
  fieldPath: plugin.fieldPath,
  setFieldValue: plugin.setFieldValue,
  getFieldValue: plugin.getFieldValue,
}))
export default class Main extends Component {
  static propTypes = {
    token: PropTypes.string,
    itemId: PropTypes.string,
    fieldPath: PropTypes.string,
    setFieldValue: PropTypes.func,
    getFieldValue: PropTypes.func,
  };

  state = {
    loading: true,
    processing: false,
    data: {},
  };

  componentDidMount() {
    const { fieldPath } = this.props;

    if (fieldPath === 'roles') {
      this.updateRolesData();
    }

    if (fieldPath === 'staff') {
      this.updateStaffData();
    }
  }

  getArtistsRoleRow(rolesLink) {
    const { processing, data } = this.state;
    const {
      token, fieldPath, getFieldValue, setFieldValue, itemId,
    } = this.props;
    let isChecked = false;
    let currentID;

    data.roles.map((selectedRole) => {
      if (selectedRole.role.id === rolesLink.id) {
        isChecked = true;
        currentID = selectedRole.id;
      }
      return null;
    });

    return (
      <span key={`artist_${rolesLink.id}`}>
        <input
          type="checkbox"
          defaultChecked={isChecked}
          disabled={processing}
          onClick={() => {
            this.setState({
              processing: true,
            });

            if (!isChecked) {
              const datoClient = new SiteClient(token);
              datoClient.items.create({
                event: itemId,
                role: rolesLink.id,
                itemType: '137165',
              })
                .then((item) => {
                  const currentFieldValue = getFieldValue(fieldPath);
                  currentFieldValue.push(item.id);
                  setFieldValue(fieldPath, currentFieldValue);

                  this.updateRolesData(true, item, rolesLink);

                  this.setState({
                    processing: false,
                  });
                })
                .catch((error) => {
                  console.log(error);

                  this.setState({
                    processing: false,
                  });
                });
            } else {
              const datoClient = new SiteClient(token);
              datoClient.items.destroy(currentID)
                .then(() => {
                  const currentFieldValue = getFieldValue(fieldPath);
                  currentFieldValue.splice(getFieldValue(fieldPath).indexOf(currentID), 1);

                  const indexInData = data.roles.map(e => e.id).indexOf(currentID);
                  data.roles.splice(indexInData, 1);

                  setFieldValue(fieldPath, currentFieldValue);

                  this.setState({
                    processing: false,
                  });
                })
                .catch((error) => {
                  console.log(error);

                  this.setState({
                    processing: false,
                  });
                });
            }
          }
          }
        />
        {rolesLink.artist.firstName}
        {' '}
        {rolesLink.artist.name}
      </span>
    );
  }

  getRoleRow(role, title, roles) {
    const artistsRows = roles.map((rolesLink) => {
      if (rolesLink.role.id === role.id) {
        return this.getArtistsRoleRow(rolesLink);
      }
      return false;
    }).filter(a => a);

    if (artistsRows.length === 0) {
      return <></>;
    }

    return (
      <li key={`title_${title.id}_role${role.id}`}>
        <h3>{role.name}</h3>
        <ul>{artistsRows}</ul>
      </li>
    );
  }

  getArtistsStaffRow(staffsLink) {
    const { processing, data } = this.state;
    const {
      token, fieldPath, getFieldValue, setFieldValue, itemId,
    } = this.props;
    let isChecked = false;
    let currentID;

    data.staff.map((selectedStaff) => {
      if (selectedStaff.staff.id === staffsLink.id) {
        isChecked = true;
        currentID = selectedStaff.id;
      }
      return null;
    });

    return (
      <li key={`artist_${staffsLink.id}`}>
        <input
          type="checkbox"
          defaultChecked={isChecked}
          disabled={processing}
          onClick={() => {
            this.setState({
              processing: true,
            });

            if (!isChecked) {
              const datoClient = new SiteClient(token);
              datoClient.items.create({
                event: itemId,
                staff: staffsLink.id,
                itemType: '148537',
              })
                .then((item) => {
                  const currentFieldValue = getFieldValue(fieldPath);
                  currentFieldValue.push(item.id);
                  setFieldValue(fieldPath, currentFieldValue);

                  this.updateStaffData(true, item, staffsLink);

                  this.setState({
                    processing: false,
                  });
                })
                .catch((error) => {
                  console.log(error);

                  this.setState({
                    processing: false,
                  });
                });
            } else {
              const datoClient = new SiteClient(token);
              datoClient.items.destroy(currentID)
                .then(() => {
                  const currentFieldValue = getFieldValue(fieldPath);
                  currentFieldValue.splice(getFieldValue(fieldPath).indexOf(currentID), 1);

                  const indexInData = data.staff.map(e => e.id).indexOf(currentID);
                  data.staff.splice(indexInData, 1);

                  setFieldValue(fieldPath, currentFieldValue);

                  this.setState({
                    processing: false,
                  });
                })
                .catch((error) => {
                  console.log(error);

                  this.setState({
                    processing: false,
                  });
                });
            }
          }
          }
        />
        {staffsLink.artist.firstName}
        {' '}
        {staffsLink.artist.name}
      </li>
    );
  }

  getStaffRow(staff, title, staffs) {
    const artistsRows = staffs.map((staffsLink) => {
      if (staffsLink.staff.id === staff.id) {
        return this.getArtistsStaffRow(staffsLink);
      }
      return false;
    }).filter(a => a);

    if (artistsRows.length === 0) {
      return <></>;
    }

    return (
      <li key={`title_${title.id}_staff${staff.id}`}>
        <h3>{staff.field.title}</h3>
        <ul>{artistsRows}</ul>
      </li>
    );
  }

  updateRolesData(cache, item, rolesLink) {
    const { token, itemId } = this.props;
    const { data } = this.state;

    this.setState({
      loading: true,
    });

    if (!cache) {
      fetch('https://graphql.datocms.com/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `{
            event(filter: {id: {eq: "${itemId}"}}) {
              production {
                id,
                titles {
                  id,
                  title
                  roles {
                    id, 
                    name
                  }
                }
                roles {
                  id,
                  role {
                    id,
                    name
                  },
                  artist{
                    firstName
                    name
                  }
                }
              },
              roles {
                id,
                role {
                  id,
                  role {
                    id,
                    name
                  }
                }
              }
            }
          }
          `,
        }),
      })
        .then(res => res.json())
        .then((res) => {
          console.log(res);
          this.setState({
            loading: false,
            data: res.data.event,
          });
        })
        .catch((error) => {
          this.setState({
            loading: false,
          });
          console.log(error);
        });
    } else {
      console.log('rolesLink', rolesLink);
      const newRecord = {
        id: item.id,
        role: {
          id: item.role,
          role: {
            id: rolesLink.role.id,
            name: rolesLink.role.name,
          },
        },
      };
      const originalData = data;
      originalData.roles.push(newRecord);

      this.setState({
        loading: false,
        data: originalData,
      });
    }
  }

  updateStaffData(cache, item, staffsLink) {
    const { token, itemId } = this.props;
    const { data } = this.state;

    this.setState({
      loading: true,
    });

    if (!cache) {
      fetch('https://graphql.datocms.com/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `{
            event(filter: {id: {eq: "${itemId}"}}) {
              production {
                id
                titles {
                  id
                  title
                  staff {
                    id 
                    field {
                      id
                      title
                    }
                  }
                }
                staff {
                  id
                  staff {
                    id
                    field {
                      id
                      title
                    }
                  },
                  artist{
                    firstName
                    name
                  }
                }
              },
              staff {
                id
                staff {
                  id
                  staff {
                    id
                    field {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
          `,
        }),
      })
        .then(res => res.json())
        .then((res) => {
          console.log(res);
          this.setState({
            loading: false,
            data: res.data.event,
          });
        })
        .catch((error) => {
          this.setState({
            loading: false,
          });
          console.log(error);
        });
    } else {
      console.log('staffsLink', staffsLink);
      const newRecord = {
        id: item.id,
        staff: {
          id: item.staff,
          staff: {
            id: staffsLink.staff.id,
            field: staffsLink.staff.field,
          },
        },
      };
      const originalData = data;
      originalData.staff.push(newRecord);
      console.log(originalData.staff);

      this.setState({
        loading: false,
        data: originalData,
      });
    }
  }

  render() {
    const { loading, data } = this.state;
    const { fieldPath } = this.props;

    if (loading) {
      return <div className="container">Načítám data...</div>;
    }

    console.log(data);

    if (fieldPath === 'roles') {
      return (
        <div className="container">
          <ul>
            {data.production.titles.map(title => (
              <li key={`title_${title.id}`}>
                <h2>
                  Titul:
                  {title.title}
                </h2>
                <ul>
                  {title.roles.map(role => this.getRoleRow(role, title, data.production.roles))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (fieldPath === 'staff') {
      return (
        <div className="container">
          <ul>
            {data.production.titles.map(title => (
              <li key={`title_${title.id}`}>
                <h2>
                  Titul:
                  {title.title}
                </h2>
                <ul>
                  {title.staff.map(staff => this.getStaffRow(staff, title, data.production.staff))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return <span>Bad field!</span>;
  }
}
