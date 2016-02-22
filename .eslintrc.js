
module.exports = {
  parser: 'babel-eslint',

  extends: './node_modules/fbjs-scripts/eslint/.eslintrc.js',

  plugins: [
    'react',
  ],

  rules: {
    'react/jsx-uses-react': 1,
    'react/react-in-jsx-scope': 1,
  }
};
