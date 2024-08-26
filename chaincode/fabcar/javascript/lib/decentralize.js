/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");

class Decentralize extends Contract {

  async registerUser(ctx, username, firstName, lastName, email, password) {
        // Check if the user already exists
        const userAsBytes = await ctx.stub.getState(username);
        if (userAsBytes && userAsBytes.length > 0) {
            throw new Error(
                `User ${username} already exists. Please create a new user.`
            );
        }

        const user = {
            firstName,
            lastName,
            email,
            password, // In production, use hashed passwords
        };
        await ctx.stub.putState(username, Buffer.from(JSON.stringify(user)));
        return JSON.stringify(user);
    }
    // Upload File and Store CID
    async uploadFile(ctx, username, cid) {
        const userAsBytes = await ctx.stub.getState(username);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${username} does not exist`);
        }

        // Append the file CID to the user's data
        const user = JSON.parse(userAsBytes.toString());
        if (!user.files) {
            user.files = [];
        }
        user.files.push(cid);

        // Update the user record in the ledger with the new file CID
        await ctx.stub.putState(username, Buffer.from(JSON.stringify(user)));
        return JSON.stringify({
            username,
            cid,
            message: "File uploaded successfully",
        });
    }

    async loginUser(ctx, username, password) {
        const userAsBytes = await ctx.stub.getState(username);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${username} does not exist`);
        }

        const user = JSON.parse(userAsBytes.toString());
        if (user.password !== password) {
            throw new Error("Incorrect password");
        }

        return JSON.stringify(user);
    }

}

module.exports = Decentralize;
