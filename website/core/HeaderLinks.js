/**
 * @providesModule HeaderLinks
 * @jsx React.DOM
 */

var HeaderLinks = React.createClass({
  links: [
    {section: 'docs', href: '/draft-js/docs/overview.html#content', text: 'docs'},
    {section: 'github', href: 'http://github.com/facebook/draft-js', text: 'github'},
  ],

  render: function() {
    return (
      <ul className="nav-site">
        {this.links.map(function(link) {
          return (
            <li key={link.section}>
              <a
                href={link.href}
                className={link.section === this.props.section ? 'active' : ''}>
                {link.text}
              </a>
            </li>
          );
        }, this)}
      </ul>
    );
  }
});

module.exports = HeaderLinks;
