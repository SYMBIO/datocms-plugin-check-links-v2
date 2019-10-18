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
    this.updateData();
  }

  getArtistsRow(rolesLink) {
    const { processing, data } = this.state;
    const {
      token, fieldPath, getFieldValue, setFieldValue,
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
                role: rolesLink.id,
                itemType: '137165',
              })
                .then((item) => {
                  const currentFieldValue = getFieldValue(fieldPath);
                  currentFieldValue.push(item.id);
                  setFieldValue(fieldPath, currentFieldValue);

                  this.updateData(true, item, rolesLink);

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
        {rolesLink.artist.firstName} {rolesLink.artist.name}
      </span>
    );
  }

  updateData(cache, item, rolesLink) {
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
                titles{
                  id,
                  title
                  roles {
                    id, 
                    title
                  }
                }
                roles {
                  id,
                  role {
                    id,
                    title
                  },
                  artist{
                    firstName
                    name
                  }
                }
              },
              roles{
                id,
                role{
                  id,
                  role{
                    id,
                    title
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
      const newRecord = {
        id: item.id,
        role: {
          id: item.role,
          role: {
            id: rolesLink.role.id,
            title: rolesLink.role.title,
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

  render() {
    const { loading, data } = this.state;

    if (loading) {
      return <div className="container">Načítám data...</div>;
    }

    return (
      <div className="container">
        <ul>
          {data.production.titles.map(title => (
            <li key={`title_${title.id}`}>
              <h2>{title.title}</h2>
              <ul>
                {title.roles.map(role => (
                  <li key={`title_${title.id}_role${role.id}`}>
                    <h3>{role.title}</h3>
                    <ul>
                      {data.production.roles.map((rolesLink) => {
                        if (rolesLink.role.id === role.id) {
                          return this.getArtistsRow(rolesLink);
                        }
                        return false;
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
