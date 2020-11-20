module.exports = async function (context, eventstream, inputCategories) {
    const CosmosClient = require("@azure/cosmos").CosmosClient;

    // yes - hardcoded - still guilty
    const endpoint = "https://movies.documents.azure.com:443/";
    const key = "{{replace-with-key}}";
    const databaseId = "movies"
    const containerId = "TopMoviesPurchased"

    // Set up connection to the CosmosDB container
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    const container = database.container(containerId);

    var query = `SELECT * FROM c order by c.OrderCount desc offset 0 limit 10`;
    context.log(`Executing following query against Cosmos: ${query}`);

    const { resources: items } = await container.items.query({ query: query }).fetchAll();
    var record = {
        "id": 1,
        "ItemId": 1,
        "name": "Most purchased movies EVER",
        "movies": items
    };

    context.log(`Updating cache entry ...`);
    const { resource: updatedItem } = await container.item("1",1).replace(record);
    context.log(`Updating cache entry ... done !`);
    context.log("All done here :)");
    return;
};