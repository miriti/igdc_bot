const forum = require('../src/forum');

async function main() {
  const message = await forum.getLastMessage();
  console.log(message);
}

main();
