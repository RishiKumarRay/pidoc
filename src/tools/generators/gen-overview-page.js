const { readFileSync } = require('fs');
const { basename, resolve } = require('path');
const { getPluginTypes, getPluginImage, getPluginCategory } = require('./paths');
const { generatePage } = require('../pages');

module.exports = function () {
  const categories = [];
  const fragments = [];
  const children = getPluginTypes().map((file) => {
    const name = basename(file).replace('.json', '');
    const image = getPluginImage(name);
    let dest = '';
    let data = null;
    let pluginCategory = '';

    try {
      dest = resolve(__dirname, '..', '..', '..', '..', 'plugins', name, 'package.json');
      data = JSON.parse(readFileSync(dest, 'utf8'));
    } catch (e) {
      dest = resolve(__dirname, '..', '..', '..', '..', 'converters', name, 'package.json');
      data = JSON.parse(readFileSync(dest, 'utf8'));
    }

    pluginCategory = getPluginCategory(data);
    this.addDependency(dest, { includedInParent: true });
    return {
      category: pluginCategory.charAt(0).toUpperCase() + pluginCategory.slice(1),
      content: `
        <ImageCard
          link="/plugins/${name}"
          image={require('../../assets/${image}')}
          description="${data.description}"
          title="${data.name}"
        />`,
    };
  });

  for (const child of children) {
    const index = categories.indexOf(child.category);

    if (index === -1) {
      categories.push(child.category);
      fragments.push({
        category: child.category,
        children: [child.content],
      });
    } else {
      fragments[index].children.push(child.content);
    }
  }

  fragments.sort((a, b) => (a.category > b.category ? 1 : -1));

  const route = '/plugins/overview';
  const pluginName = 'overview';
  const displayName = 'All Plugins';

  const head = `
    import { ImageCard, PageContent } from '../../scripts/components';
  `;

  const body = `
      <PageContent>
        <div className="plugin-info">
          <h1>Plugins Overview</h1>
        </div>
      ${fragments
        .map(
          (fragment) => `
          <h2 id="${fragment.category.toLowerCase()}" className="plugin">${fragment.category} Plugins</h2>
          <div className="boxes title-cards">${fragment.children.join('')}</div>
        `,
        )
        .join('')}
    </PageContent>
  `;

  const rendered = generatePage(pluginName, { link: route }, pluginName, head, body, route, displayName);

  return [rendered];
};
