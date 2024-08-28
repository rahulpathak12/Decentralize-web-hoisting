const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

async function connectToNetwork() {
  // load the network configuration
  const ccpPath = path.resolve(
    __dirname,
    "/home/user/Decentralize web hoisting/fabric-samples",
    "test-network",
    "organizations",
    "peerOrganizations",
    "org1.example.com",
    "connection-org1.json"
  );
  let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(process.cwd(), "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  // Check to see if we've already enrolled the user.
  const identity = await wallet.get("appUser");
  if (!identity) {
    console.log(
      'An identity for the user "appUser" does not exist in the wallet'
    );
    console.log("Run the registerUser.js application before retrying");
    return;
  }

  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: "appUser",
    discovery: { enabled: true, asLocalhost: true },
  });

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork("mychannel");

  // Get the contract from the network.
  const contract = network.getContract("basic");

  return { gateway, contract };
}

// Register User
async function registerUser(username, firstName, lastName, email, password) {
  const { gateway, contract } = await connectToNetwork();
  await contract.submitTransaction(
    "registerUser",
    username,
    firstName,
    lastName,
    email,
    password
  );
  gateway.disconnect();
}

// Login User
async function loginUser(username, password) {
  const { gateway, contract } = await connectToNetwork();
  const user = await contract.evaluateTransaction(
    "loginUser",
    username,
    password
  );
  gateway.disconnect();
  return JSON.parse(user.toString());
}

// Upload File and Store CID on Hyperledger
async function uploadFile(username, cid) {
  try {
    // Store CID in Hyperledger Fabric
    const { gateway, contract } = await connectToNetwork();
    await contract.submitTransaction("uploadFile", username, cid);
    gateway.disconnect();

    // Return a success response
    return { cid, message: "Website uploaded successfully" };
  } catch (error) {
    // Return an error message
    return { message: `Website upload failed: ${error.message}` };
  }
}

module.exports = {
  registerUser,
  loginUser,
  uploadFile,
};
