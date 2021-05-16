const { readdirSync, existsSync, readFileSync } = require('fs');
const { resolve, basename, extname } = require('path');

const readme = 'README.md';
const categoryPrefix = 'plugin-';
const docs = resolve(__dirname, '../../../../../docs');
const packagesRoot = resolve(__dirname, '../../../..');
const tutorials = resolve(docs, 'tutorials');
const samples = resolve(docs, 'examples');
const questions = resolve(docs, 'questions');
const reference = resolve(docs, 'reference');
const commands = resolve(docs, 'commands');
const messages = resolve(docs, 'messages');
const types = resolve(docs, 'types');
const tools = resolve(docs, 'tools');
const specs = resolve(docs, 'specs');

const packages = {
  plugins: getPackages('plugins'),
  converters: getPackages('converters'),
  framework: getPackages('framework'),
  utilities: getPackages('utilities'),
  tooling: getPackages('tooling'),
};

const corePackages = [...packages.framework, ...packages.utilities, ...packages.tooling];

const pluginPackages = [...packages.plugins, ...packages.converters];

function getPackages(dirName) {
  const dir = resolve(packagesRoot, dirName);
  return readdirSync(dir).filter(name => existsSync(resolve(dir, name, 'package.json')));
}

function getCategory(keywords) {
  return keywords
    .filter(keyword => keyword.startsWith(categoryPrefix))
    .map(keyword => keyword.substr(categoryPrefix.length))[0];
}

function readReadme(dir) {
  const refFormat = /\- \[(.*)\]\((.*)\)/g;
  const readme = readFileSync(resolve(dir, 'README.md'));
  const results = [];

  do {
    const result = refFormat.exec(readme);

    if (!result) {
      break;
    }

    const name = result[2];

    if (!name.endsWith('README.md')) {
      results.push(resolve(dir, name));
    }
  } while (true);

  return results;
}

function getDocsFrom(dir, tester = /\.md$/) {
  return readdirSync(dir)
    .sort()
    .filter(name => tester.test(name) && name !== readme)
    .map(name => resolve(dir, name));
}

function getPackageRoot(packageName) {
  for (const key of Object.keys(packages)) {
    if (packages[key].includes(packageName)) {
      return resolve(packagesRoot, key, packageName);
    }
  }
}

function isCoreType(fileName) {
  return corePackages.some(name => fileName.endsWith(`${name}.json`));
}

function isPluginType(fileName) {
  return pluginPackages.some(name => fileName.endsWith(`${name}.json`));
}

function getTutorials() {
  return getDocsFrom(tutorials);
}

function getSamples() {
  return getDocsFrom(samples);
}

function getQuestions() {
  return getDocsFrom(questions);
}

function getReferences() {
  return readReadme(reference);
}

function getCommands() {
  return getDocsFrom(commands);
}

function getTools() {
  return getDocsFrom(tools);
}

function getBundlers() {

  const toolingRoot = resolve(packagesRoot, 'tooling');
  const webpackRoot = resolve(toolingRoot, 'piral-cli-webpack');
  const parcelRoot = resolve(toolingRoot, 'piral-cli-parcel');

  return [
    resolve(webpackRoot, 'README.md'),
    resolve(parcelRoot, 'README.md')
  ];
}

function getCodes() {
  return getDocsFrom(messages);
}

function getSpecs() {
  return getDocsFrom(specs);
}

function getCoreTypes() {
  return getDocsFrom(types, /\.json$/).filter(file => isCoreType(file));
}

function getPluginCategory(plugin) {
  return getCategory(plugin.keywords);
}

function getPluginTypes() {
  return getDocsFrom(types, /\.json$/).filter(file => !file.endsWith('piral-ext.json') && isPluginType(file));
}

function getPluginImage(name) {
  const rest = name.replace('piral-', '');
  const hasImage = existsSync(resolve(__dirname, '..', 'assets', 'extensions', `${rest}.png`));
  return hasImage ? `extensions/${rest}.png` : 'top-extensions.png';
}

function getDocs() {
  return readReadme(docs);
}

function getName(file) {
  return (file && basename(file).replace(extname(file), '')) || '';
}

module.exports = {
  packagesRoot,
  corePackages,
  pluginPackages,
  getPackageRoot,
  packages,
  getTutorials,
  getSamples,
  getQuestions,
  getReferences,
  getCommands,
  getTools,
  getBundlers,
  getCodes,
  getPluginCategory,
  getPluginTypes,
  getPluginImage,
  getSpecs,
  getCoreTypes,
  getDocs,
  getName,
  getRelativePath,
  getAbsolutePath,
};
