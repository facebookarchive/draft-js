import querystring from 'querystring';

const QUERY_STRINGS = querystring.parse(window.location.search.substring(1));

// overwrite the feature flag stub object
const GKManager = (window.__DRAFT_GKX = {});

// enable or disable feature flags
const flagControls = {
  gk_disable: flags =>
    flags.forEach(flag => (window.__DRAFT_GKX[flag] = false)),
  gk_enable: flags => flags.forEach(flag => (window.__DRAFT_GKX[flag] = true)),
};

Object.keys(flagControls)
  .filter(flag => QUERY_STRINGS[flag])
  .forEach(flag => flagControls[flag](QUERY_STRINGS[flag].split(',')));

export default GKManager;
