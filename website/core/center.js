/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @jsx React.DOM
 */

var React = require('React');

var assign = require('object-assign');

var center = React.createClass({
  render: function() {
    var {style, ...props} = this.props;
    style = assign({}, style, {textAlign: 'center'});

    return (
      <div {...props} style={style}>{this.props.children}</div>
    );
  },
});

module.exports = center;
