module.exports = async function (context, input) {
    const CosmosClient = require("@azure/cosmos").CosmosClient;
    const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

    context.log('Document Id: ', input[0].id);
    
    // yes - hardcoded - guilty
    const endpoint = "https://movies.documents.azure.com:443/";
    const key = "{{replace-with-key}}";
    const databaseId = "movies"
    const containerId = "Category"

    // Set up connection to the CosmosDB container
    const client = new CosmosClient({ endpoint, key });   
    const database = client.database(databaseId);
    const container = database.container(containerId);

    // Query the Categories table in a way that returns an object in the format
    // that we want to cache
    const querySpec = {
      query: "SELECT c.CategoryId, c.CategoryName FROM c"
    };
    const { resources: items } = await container.items
        .query(querySpec)
        .fetchAll();

    var content = JSON.stringify(items);
    context.log("Received values from CosmosDB: " + content);

    // Store this to BLOB
    const account = "testbacpacopenhack";
    const accountKey = "{{replace-with-key}}";
    const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
    const containerName = "cache";
    const blobName = "categoryCache.json"

    const blobServiceClient = new BlobServiceClient('https://' + account + '.blob.core.windows.net',sharedKeyCredential);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.upload(content, Buffer.byteLength(content));
    context.log("Finished uploading file to blob " + blobName);
    context.done();
};
