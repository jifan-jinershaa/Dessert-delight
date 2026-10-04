// Loads the dessert catalog once at startup. Prices used for orders come from
// here (server-side), never from the browser.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'desserts.json');
const desserts = JSON.parse(fs.readFileSync(file, 'utf-8'));

const byId = new Map(desserts.map((d) => [d.id, d]));
const byName = new Map(desserts.map((d) => [d.name.toLowerCase(), d]));

function findDessert(item = {}) {
  if (item.id && byId.has(item.id)) return byId.get(item.id);
  if (item.name) return byName.get(String(item.name).toLowerCase().trim()) || null;
  return null;
}

module.exports = { desserts, findDessert };
