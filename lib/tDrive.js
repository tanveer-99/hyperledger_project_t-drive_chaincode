/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class TDrive extends Contract {

    // async InitLedger(ctx) {
    //     const assets = [
    //         {
    //             ID: 'asset1',
    //             Color: 'blue',
    //             Size: 5,
    //             Owner: 'Tomoko',
    //             AppraisedValue: 300,
    //         },
    //         {
    //             ID: 'asset2',
    //             Color: 'red',
    //             Size: 5,
    //             Owner: 'Brad',
    //             AppraisedValue: 400,
    //         },
    //         {
    //             ID: 'asset3',
    //             Color: 'green',
    //             Size: 10,
    //             Owner: 'Jin Soo',
    //             AppraisedValue: 500,
    //         },
    //         {
    //             ID: 'asset4',
    //             Color: 'yellow',
    //             Size: 10,
    //             Owner: 'Max',
    //             AppraisedValue: 600,
    //         },
    //         {
    //             ID: 'asset5',
    //             Color: 'black',
    //             Size: 15,
    //             Owner: 'Adriana',
    //             AppraisedValue: 700,
    //         },
    //         {
    //             ID: 'asset6',
    //             Color: 'white',
    //             Size: 15,
    //             Owner: 'Michel',
    //             AppraisedValue: 800,
    //         },
    //     ];

    //     for (const asset of assets) {
    //         asset.docType = 'asset';
    //         // example of how to write to world state deterministically
    //         // use convetion of alphabetic order
    //         // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    //         // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
    //         await ctx.stub.putState(asset.ID, Buffer.from(stringify(sortKeysRecursive(asset))));
    //     }
    // }

    // CreateAsset issues a new asset to the world state with given details.
    
    








    // create user 
    async CreateUser(ctx, id, email, password, name) {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const user = {
            ID: id,
            Email: email,
            Password: password,
            Name: name,
            DocType: 'user'
        };

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(user))));
        return JSON.stringify(user);
    }





    // Find user method
    async FindUser(ctx, email, password) {
        
        const ID = `user_${email}`;
        const userJSON = await ctx.stub.getState(ID); // get the asset from chaincode state
        
        if (!userJSON || userJSON.length === 0) {
            throw new Error(`The user with email: ${email} does not exist`);
        }

        const user = JSON.parse(userJSON.toString());

        if(user.Password !== password) {
            throw new Error("email and password do not match any user in our system");
        }

        return userJSON.toString();
    }






    // Create file method
    async CreateFile(ctx, id, name, downloadLink, fileHash, uploaderEmail) {

        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const file = {
            ID: id,
            Name: name,
            DownloadLink: downloadLink,
            FileHash: fileHash,
            UploaderEmail: uploaderEmail,
            DocType: 'file'
        };

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(file))));
        return JSON.stringify(file);
    }





    // find file method
    async FindFile(ctx, id) {

        const fileJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        
        if (!fileJSON || fileJSON.length === 0) {
            throw new Error(`The file does not exist`);
        }
        return fileJSON.toString();
    }





    // change file name method
    async ChangeFileName(ctx, id, newName, newDownloadLink) {

        const fileJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        
        if (!fileJSON || fileJSON.length === 0) {
            throw new Error(`The file does not exist`);
        }

        let fileData = JSON.parse(fileJSON.toString());
        fileData.Name = newName;
        fileData.DownloadLink = newDownloadLink;

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(fileData))));


        return JSON.stringify(fileData);
    }






    // delete file method
    async DeleteFile(ctx, id) {

         const fileJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        
        if (!fileJSON || fileJSON.length === 0) {
            throw new Error(`The file does not exist`);
        }

        await ctx.stub.deleteState(id);

        return JSON.stringify({
            status: 'file deleted'
        })
    }





    // find file by user method
    async FindFileByUser(ctx, email) {

        let queryString = {};
		queryString.selector = {};
		queryString.selector.DocType = 'file';
		queryString.selector.UploaderEmail = email;

        return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));  
    }






    // share file method
    async ShareFile(ctx, id, fileKey, sharedWithEmail) {

        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const fileShare = {
            ID: id,
            FileKey: fileKey,
            SharedWithEmail: sharedWithEmail,
            DocType: 'fileShare'
        };

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(fileShare))));
        return JSON.stringify(fileShare);
    }




     // find fileShare method
     async FindFileShare(ctx, fileShareKey) {

        const fileShareJSON = await ctx.stub.getState(fileShareKey); // get the asset from chaincode state
        
        if (!fileShareJSON || fileShareJSON.length === 0) {
            throw new Error(`The fileShare does not exist`);
        }
        return fileShareJSON.toString();
    }




    // find fileShare by file method
    async FindFileShareByFile(ctx, fileKey) {

        let queryString = {};
		queryString.selector = {};
		queryString.selector.DocType = 'fileShare';
		queryString.selector.FileKey = fileKey;

        return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));  
    }







    // delete fileShare method
    async DeleteFileShare(ctx, id) {

        const fileShareJSON = await ctx.stub.getState(id); // get the asset from chaincode state
       
       if (!fileShareJSON || fileShareJSON.length === 0) {
           throw new Error(`The fileShare does not exist`);
       }

       await ctx.stub.deleteState(id);

       return JSON.stringify({
           status: 'fileShare deleted'
       })
   }







   // find fileShare by user method
   async FindFileSharedWithUser(ctx, userEmail) {

    let queryString = {};
    queryString.selector = {};
    queryString.selector.DocType = 'fileShare';
    queryString.selector.SharedWithEmail = userEmail;

    return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));  
}









    // GetQueryResultForQueryString and _GetAllResults methods from asset-transfer-ledger-queries
    async GetQueryResultForQueryString(ctx, queryString) {

		let resultsIterator = await ctx.stub.getQueryResult(queryString);
		let results = await this._GetAllResults(resultsIterator, false);

		return JSON.stringify(results);
	}
    async _GetAllResults(iterator, isHistory) {
		let allResults = [];
		let res = await iterator.next();
		while (!res.done) {
			if (res.value && res.value.value.toString()) {
				let jsonRes = {};
				console.log(res.value.value.toString('utf8'));
				if (isHistory && isHistory === true) {
					jsonRes.TxId = res.value.txId;
					jsonRes.Timestamp = res.value.timestamp;
					try {
						jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Value = res.value.value.toString('utf8');
					}
				} else {
					jsonRes.Key = res.value.key;
					try {
						jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Record = res.value.value.toString('utf8');
					}
				}
				allResults.push(jsonRes);
			}
			res = await iterator.next();
		}
		iterator.close();
		return allResults;
	}


    













   

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, id, color, size, owner, appraisedValue) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    async TransferAsset(ctx, id, newOwner) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        const oldOwner = asset.Owner;
        asset.Owner = newOwner;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldOwner;
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = TDrive;
