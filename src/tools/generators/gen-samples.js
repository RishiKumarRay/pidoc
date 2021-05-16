const { getSamples, getName } = require('./paths');
const { render } = require('../markdown');
const { generated } = require('../meta');
const { generateStandardPage } = require('../pages');

function getRoute(name) {
  return (name && `/guidelines/examples/${name}`) || '';
}

module.exports = function () {
  const files = getSamples();

  const imports = files.map((file) => {
    const name = getName(file);
    const route = getRoute(name);
    const { mdValue, meta = {} } = render(file, generated);
    const pageMeta = {
      ...meta,
      link: route,
      source: file,
    };

    this.addDependency(file, { includedInParent: true });
    return generateStandardPage(name, pageMeta, `sample-${name}`, file, mdValue, route, meta.title);
  });

  return imports;
};
