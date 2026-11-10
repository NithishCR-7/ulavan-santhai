const fs = require("fs");
const path = require("path");
const os = require("os");
const net = require("net");

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const netInfo of nets[name]) {
      if (netInfo.family === "IPv4" && !netInfo.internal) {
        return netInfo.address;
      }
    }
  }
  return "127.0.0.1";
}

function probePort(ip, port = 5000, timeout = 350) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, ip);
  });
}

function updateEnv(ipOrHost, port = "5000") {
  // Prevent invalid 0.0.0.0 as client connect URL
  if (ipOrHost === "0.0.0.0" || ipOrHost === "http://0.0.0.0:5000" || ipOrHost.includes("0.0.0.0")) {
    console.log("\x1b[33m⚠ Note: 0.0.0.0 is a server listen address, not a client address. Using localhost instead.\x1b[0m");
    ipOrHost = "localhost";
  }

  const envPath = path.resolve(process.cwd(), ".env.local");
  const protocol = ipOrHost.startsWith("http") ? "" : "http://";
  const hasPort = ipOrHost.includes(":") && !ipOrHost.endsWith("http://") && !ipOrHost.endsWith("https://");
  const url = `${protocol}${ipOrHost}${hasPort ? "" : `:${port}`}`;

  const content = `# Ulavan Santhai - Dynamic Environment Config
# Auto-configured on ${new Date().toLocaleString()}
BACKEND_URL=${url}
NEXT_PUBLIC_API_URL=${url}
`;

  fs.writeFileSync(envPath, content, "utf8");
  console.log(`\x1b[32m✔ .env.local updated to:\x1b[0m ${url}`);
}

async function scanSubnet(port = 5000) {
  // 1. Check localhost first
  const isLocal = await probePort("127.0.0.1", port, 200);
  if (isLocal) {
    console.log(`\x1b[32m✔ Found backend running locally on localhost:${port}\x1b[0m`);
    updateEnv("localhost", port);
    return;
  }

  const myIp = getLocalIp();
  const subnet = myIp.substring(0, myIp.lastIndexOf(".")) || "192.168.1";
  console.log(`\x1b[36m🔍 Scanning subnet ${subnet}.1 to ${subnet}.254 on port ${port}...\x1b[0m`);

  const promises = [];
  const candidates = [];

  for (let i = 1; i <= 254; i++) {
    const targetIp = `${subnet}.${i}`;
    promises.push(
      probePort(targetIp, port, 350).then((isOpen) => {
        if (isOpen) candidates.push(targetIp);
      })
    );
  }

  await Promise.all(promises);

  if (candidates.length > 0) {
    console.log(`\x1b[32m✔ Found backend server active at:\x1b[0m ${candidates[0]}`);
    updateEnv(candidates[0], port);
  } else {
    console.log(`\x1b[33m⚠ No backend detected on subnet (port ${port} is not listening anywhere). Defaulting to localhost:${port}.\x1b[0m`);
    console.log(`\x1b[33m👉 Make sure your teammate has started their backend server (npm start / node server.js)!\x1b[0m`);
    updateEnv("localhost", port);
  }
}

async function main() {
  const arg = process.argv[2];

  if (arg === "scan" || arg === "auto" || !arg) {
    await scanSubnet(5000);
  } else if (arg === "local" || arg === "localhost") {
    updateEnv("localhost", 5000);
  } else {
    updateEnv(arg, 5000);
  }
}

main().catch(console.error);
