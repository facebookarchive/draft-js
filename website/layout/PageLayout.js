/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @providesModule PageLayout
 * @jsx React.DOM
 */

var React = require('React');
var createReactClass = require('create-react-class');
var Site = require('Site');
var Marked = require('Marked');

var support = createReactClass({
  render: function() {
    var metadata = this.props.metadata;
    var content = this.props.children;
    return (
      <Site section={metadata.section}>
        <section className="content wrap documentationContent nosidebar">
          <div className="inner-content">
            <Marked>{content}</Marked>
          </div>
        </section>
      </Site>
    );
  },
});

module.exports = support;
