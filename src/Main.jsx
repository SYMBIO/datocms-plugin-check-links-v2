import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SiteClient } from 'datocms-client';

import connectToDatoCms from './connectToDatoCms';
import './style.css';

@connectToDatoCms((plugin) => ({
  token: plugin.parameters.global.datoCmsApiToken,
  itemId: plugin.itemId,
  fieldPath: plugin.fieldPath,
  setFieldValue: plugin.setFieldValue,
  getFieldValue: plugin.getFieldValue,
}))
class Main extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      processing: false,
      data: {
        production: null,
      },
    };
  }

  componentDidMount() {
    const { fieldPath } = this.props;

    if (fieldPath === 'roles') {
      this.loadRolesData();
    }

    if (fieldPath === 'staff') {
      this.loadStaffData();
    }
  }

  getArtistsRoleRow(rolesLink) {
    const { processing, data } = this.state;
    let exists = false;
    let currentID;

    data.roles.map((selectedRole) => {
      if (selectedRole.role.id === rolesLink.id) {
        exists = true;
        currentID = selectedRole.id;
      }
      return null;
    });

    return (
      <li key={`artist_${rolesLink.id}`}>
        <label>
          <input
            type="checkbox"
            checked={exists}
            disabled={processing}
            onChange={() => {
              if (exists) {
                this.removeRole(rolesLink, currentID);
              } else {
                this.addRoles([rolesLink]);
              }
            }}
          />
          {rolesLink.artist.firstName} {rolesLink.artist.name}
        </label>
      </li>
    );
  }

  getRoleRow(role, roles) {
    const artistsRows = roles
      .map((rolesLink) => {
        if (rolesLink.role.id === role.id) {
          return this.getArtistsRoleRow(rolesLink);
        }
        return false;
      })
      .filter((a) => a);

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

  getStaffRow(staff, staffs) {
    const artistsRows = staffs
      .map((staffsLink) => {
        if (staffsLink.staff.id === staff.id) {
          return this.getArtistsStaffRow(staffsLink);
        }
        return false;
      })
      .filter((a) => a);

    if (artistsRows.length === 0) {
      return <></>;
    }

    return (
      <li key={`title_staff${staff.id}`}>
        <h3>{staff.field.title}</h3>
        <ul>{artistsRows}</ul>
      </li>
    );
  }

  getArtistsStaffRow(staffsLink) {
    const { processing, data } = this.state;
    let exists = false;
    let currentID;

    data.staff.forEach((selectedStaff) => {
      if (selectedStaff.staff.id === staffsLink.id) {
        exists = true;
        currentID = selectedStaff.id;
      }
    });

    return (
      <li key={`artist_${staffsLink.id}`}>
        <input
          type="checkbox"
          checked={exists}
          disabled={processing}
          onChange={() => {
            if (exists) {
              this.removeStaff(staffsLink, currentID);
            } else {
              this.addStaffs([staffsLink]);
            }
          }}
        />
        {staffsLink.artist.firstName} {staffsLink.artist.name}
      </li>
    );
  }

  async addRoles(rolesLinks) {
    const {
      token,
      fieldPath,
      getFieldValue,
      setFieldValue,
      itemId,
    } = this.props;

    this.setState({ processing: true });

    const datoClient = new SiteClient(token);
    const promises = [];
    rolesLinks.forEach((r) => {
      promises.push(
        datoClient.items.create({
          event: itemId,
          role: r.id,
          itemType: '137165',
        }),
      );
    });

    try {
      const items = await Promise.all(promises);
      const currentFieldValue = getFieldValue(fieldPath);
      items.forEach((item) => {
        currentFieldValue.push(item.id);
      });
      setFieldValue(fieldPath, currentFieldValue);

      const newData = this.updateRolesData(items, rolesLinks);

      this.setState({
        processing: false,
        data: newData,
      });
    } catch (error) {
      console.log(error);
      this.setState({ processing: false });
    }
  }

  async removeRole(rolesLink, currentID) {
    const { token, fieldPath, getFieldValue, setFieldValue } = this.props;

    const { data } = this.state;

    this.setState({ processing: true });

    const datoClient = new SiteClient(token);
    await datoClient.items.destroy(currentID);
    const currentFieldValue = getFieldValue(fieldPath);
    currentFieldValue.splice(getFieldValue(fieldPath).indexOf(currentID), 1);

    const indexInData = data.roles.map((e) => e.id).indexOf(currentID);
    data.roles.splice(indexInData, 1);

    console.log(currentFieldValue);

    setFieldValue(fieldPath, currentFieldValue);

    this.setState({
      processing: false,
    });
  }

  removeRoles() {
    const { token, fieldPath, setFieldValue } = this.props;
    const { data } = this.state;
    const datoClient = new SiteClient(token);

    this.setState({ processing: true });

    const newData = { ...data };

    setFieldValue(fieldPath, []);

    const promises = [];
    newData.roles.forEach((r) => {
      promises.push(datoClient.items.destroy(r.id));
    });

    Promise.all(promises)
      .then(() => {
        newData.roles = [];

        this.setState({
          data: newData,
          processing: false,
        });
      })
      .catch(() => {
        this.setState({
          processing: false,
        });
      });
  }

  loadRolesData() {
    const { token, itemId } = this.props;

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
      .then((res) => res.json())
      .then((res) => {
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
  }

  updateRolesData(items, rolesLinks) {
    const { data } = this.state;

    const newData = { ...data };
    items.forEach((item, i) => {
      const newRecord = {
        id: item.id,
        role: {
          id: item.role,
          role: {
            id: rolesLinks[i].role.id,
            name: rolesLinks[i].role.name,
          },
        },
      };
      newData.roles.push(newRecord);
    });

    return newData;
  }

  async addStaffs(staffsLinks) {
    const {
      token,
      fieldPath,
      getFieldValue,
      setFieldValue,
      itemId,
    } = this.props;

    this.setState({ processing: true });

    const datoClient = new SiteClient(token);
    const promises = [];
    staffsLinks.forEach((s) => {
      promises.push(
        datoClient.items.create({
          event: itemId,
          staff: s.id,
          itemType: '148537',
        }),
      );
    });

    try {
      const items = await Promise.all(promises);
      const currentFieldValue = getFieldValue(fieldPath);
      items.forEach((item) => {
        currentFieldValue.push(item.id);
      });
      setFieldValue(fieldPath, currentFieldValue);

      const newData = this.updateStaffData(items, staffsLinks);

      this.setState({
        processing: false,
        data: newData,
      });
    } catch (error) {
      console.log(error);
      this.setState({ processing: false });
    }
  }

  async removeStaff(staffsLink, currentID) {
    const { token, fieldPath, getFieldValue, setFieldValue } = this.props;

    const { data } = this.state;

    this.setState({ processing: true });

    const datoClient = new SiteClient(token);
    await datoClient.items.destroy(currentID);
    const currentFieldValue = getFieldValue(fieldPath);
    currentFieldValue.splice(getFieldValue(fieldPath).indexOf(currentID), 1);

    const indexInData = data.staff.map((e) => e.id).indexOf(currentID);
    data.staff.splice(indexInData, 1);

    setFieldValue(fieldPath, currentFieldValue);

    this.setState({
      processing: false,
    });
  }

  removeStaffs() {
    const { token, fieldPath, setFieldValue } = this.props;
    const { data } = this.state;
    const datoClient = new SiteClient(token);

    this.setState({ processing: true });

    const newData = { ...data };

    setFieldValue(fieldPath, []);

    const promises = [];
    newData.staff.forEach((s) => {
      promises.push(datoClient.items.destroy(s.id));
    });

    Promise.all(promises)
      .then(() => {
        newData.staff = [];

        this.setState({
          data: newData,
          processing: false,
        });
      })
      .catch(() => {
        this.setState({
          processing: false,
        });
      });
  }

  loadStaffData() {
    const { token, itemId } = this.props;

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
      .then((res) => res.json())
      .then((res) => {
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
  }

  updateStaffData(items, staffsLinks) {
    const { data } = this.state;

    const newData = { ...data };
    items.forEach((item, i) => {
      const newRecord = {
        id: item.id,
        staff: {
          id: item.staff,
          staff: {
            id: staffsLinks[i].staff.id,
            field: staffsLinks[i].staff.field,
          },
        },
      };
      newData.staff.push(newRecord);
    });

    return newData;
  }

  render() {
    const { loading, data } = this.state;
    const { fieldPath } = this.props;

    if (loading) {
      return <div className="container">Načítám data...</div>;
    }

    if (fieldPath === 'roles') {
      return (
        <div className="container">
          <ul>
            {data.production.titles.map((title) => (
              <li key={`title_${title.id}`}>
                <div>
                  <h2>Titul: {title.title}</h2>
                  <button
                    type="button"
                    onClick={() => {
                      this.addRoles(
                        data.production.roles.filter(
                          (r) => !data.roles.find((rr) => rr.role.id === r.id),
                        ),
                      );
                    }}
                  >
                    Zaškrtnout vše
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      this.removeRoles();
                    }}
                  >
                    Odškrtnout vše
                  </button>
                </div>
                <ul>
                  {title.roles.map((role) =>
                    this.getRoleRow(role, data.production.roles),
                  )}
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
            {data.production.titles.map((title) => (
              <li key={`title_${title.id}`}>
                <div>
                  <h2>Titul: {title.title}</h2>
                  <button
                    type="button"
                    onClick={() => {
                      this.addStaffs(
                        data.production.staff.filter(
                          (s) => !data.staff.find((ss) => ss.staff.id === s.id),
                        ),
                      );
                    }}
                  >
                    Zaškrtnout vše
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      this.removeStaffs();
                    }}
                  >
                    Odškrtnout vše
                  </button>
                </div>
                <ul>
                  {title.staff.map((staff) =>
                    this.getStaffRow(staff, data.production.staff),
                  )}
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

Main.propTypes = {
  token: PropTypes.string,
  itemId: PropTypes.string,
  fieldPath: PropTypes.string,
  setFieldValue: PropTypes.func,
  getFieldValue: PropTypes.func,
};

export default Main;
