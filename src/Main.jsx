import React, { Component } from 'react';
import PropTypes from 'prop-types';

import connectToDatoCms from './connectToDatoCms';
import './style.css';
import RoleRow from './RoleRow';
import StaffRow from './StaffRow';

@connectToDatoCms(plugin => ({
  plugin,
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
    const { plugin, fieldPath } = this.props;

    plugin.addFieldChangeListener('production', () => {
      if (fieldPath.substr(0, 5) === 'roles') {
        this.loadRolesData();
      }

      if (fieldPath.substr(0, 5) === 'staff') {
        this.loadStaffData();
      }
    });

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

  loadRolesData() {
    const { token, productionId } = this.props;

    if (!productionId) {
      return;
    }

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
              dateFrom
              dateTo
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

    if (!productionId) {
      return;
    }

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
              dateFrom
              dateTo
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
    const { loading, data, selected } = this.state;
    const { fieldPath, getFieldValue } = this.props;

    if (loading) {
      return <div className="container">Načítám data...</div>;
    }

    if (fieldPath.substr(0, 5) === 'roles') {
      return (
        <div className="container">
          <ul>
            {data &&
              Array.isArray(data.titles) &&
              data.titles.map(title => (
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
                  {title && Array.isArray(title.roles) && (
                    <ul>
                      {title.roles.map(role => (
                        <RoleRow
                          role={role}
                          roles={data.roles}
                          selected={selected}
                          setSelected={newSelected => {
                            this.setState({ selected: newSelected });
                          }}
                          startAt={getFieldValue('start_at')}
                        />
                      ))}
                    </ul>
                  )}
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
            {data &&
              Array.isArray(data.titles) &&
              data.titles.map(title => (
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
                  {title && Array.isArray(title.staff) && (
                    <ul>
                      {title.staff.map(staff => (
                        <StaffRow
                          staff={staff}
                          staffs={data.staff}
                          selected={selected}
                          setSelected={newSelected => {
                            this.setState({ selected: newSelected });
                          }}
                          startAt={getFieldValue('start_at')}
                        />
                      ))}
                    </ul>
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
  plugin: PropTypes.any,
  token: PropTypes.string,
  fieldPath: PropTypes.string,
  setFieldValue: PropTypes.func,
  getFieldValue: PropTypes.func,
  productionId: PropTypes.string,
};

export default Main;
