module.exports = async function (context, input) {
    const CosmosClient = require("@azure/cosmos").CosmosClient;
    const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

    context.log('Document Id: ', input[0].id);
    
    // yes - hardcoded - guilty
    const endpoint = "https://movies.documents.azure.com:443/";
    const key = "{{replace-with-key}}";
    const databaseId = "movies"
    const containerId = "eventstream"

    // Set up connection to the CosmosDB container
    const client = new CosmosClient({ endpoint, key });   
    const database = client.database(databaseId);
    const container = database.container(containerId);

    // Query the Categories table in a way that returns an object in the format
    // that we want to cache

    const HOUR = 1000 * 60 * 60;
    const anHourAgo = Date.now() - HOUR;
    const querySpec = {
      query: "SELECT * FROM c WHERE (c['OrderDate'] >= " + anHourAgo + ")"
    };
    const { resources: items } = await container.items
        .query(querySpec)
        .fetchAll();

    var content = JSON.stringify(items);
    context.log("Received values from CosmosDB: " + content);

    // Store this back to CosmosDB in a new collection that supports a point-read
    // aka - the materialized view

    context.done();
};
