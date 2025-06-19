const Aternos = require("aternos-api");

(async () => {
  const aternos = new Aternos();
  await aternos.login("your_email", "your_password");
  
  const servers = await aternos.listServers();
  const server = servers[0]; // pick the first one

  console.log("Starting server...");
  await server.start();

  // Optional: Wait until it's online
  while ((await server.fetch()).status !== "online") {
    console.log("Waiting for server to come online...");
    await new Promise(r => setTimeout(r, 10000));
  }

  console.log("Server is now online!");
})();
