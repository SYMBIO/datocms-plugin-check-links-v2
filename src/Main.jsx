import React, { Component } from 'react';
import PropTypes from 'prop-types';

import connectToDatoCms from './connectToDatoCms';
import './style.css';

@connectToDatoCms(plugin => ({
  token: plugin.parameters.global.datoCmsApiToken,
  itemId: plugin.itemId,
}))
export default class Main extends Component {
  static propTypes = {
    token: PropTypes.string,
    itemId: PropTypes.string,
  };

  state = {
    loading: true,
    data: {},
  };

  componentDidMount() {
    this.updateData();
  }

  render() {
    const { loading } = this.state;

    if (loading) {
      return <div className="container">Načítám data...</div>;
    }

    return (
      <div className="container">
        Loaded.
      </div>
    );
  }
}
