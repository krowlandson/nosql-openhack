/**
 * Function does the following:
 * - Listen to new incoming orders in the 'eventstream' collection
 * - For each of those orders, look into the order lines (details) and extract the movie id and quantity
 * - Find the movie in the Movies table ('item') in Cosmos and bump its 'OrderCount' by the quantity
 * - Save back to CosmosDB
 */
module.exports = async function (context, eventstream, inputCategories) {
    if (!eventstream || !inputCategories || !eventstream[0].Details || eventstream[0].Details.length == 0) {
        context.log.warn(`Invalid input received - here's what we got: ${JSON.stringify(eventstream)}`);
        return false;
    }
    const CosmosClient = require("@azure/cosmos").CosmosClient;

    // yes - hardcoded - still guilty
    const endpoint = "https://movies.documents.azure.com:443/";
    const key = "{{replace-with-key}}";
    const databaseId = "movies"
    const containerId = "Item"

    // Set up connection to the CosmosDB container
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    const container = database.container(containerId);

    var listOfProductsWithQuantity = [];
    eventstream.forEach(order => {
        context.log(`Gathering details from order - found ${order.Details.length} orders`);
        order.Details.forEach(detail => listOfProductsWithQuantity.push({ id: detail.ProductId, count: detail.Quantity }));
    });

    // Get a list of ProductIds looking like : ( 123, 1234, 23435)
    // NOTE: parenthesis not brackes and no quotes
    var itemIds = `${listOfProductsWithQuantity.map(item => item.id).join(",")}`;
    var query = `SELECT * FROM c WHERE c.ItemId IN ( ${itemIds} )`;
    context.log(`Executing following query against Cosmos: ${query}`);

    const { resources: items } = await container.items.query({ query: query }).fetchAll();

    items.forEach(movie => {
        newOrder = listOfProductsWithQuantity.filter(i => i.id == movie.ItemId)[0];        
        if (!!movie.OrderCount) {
            movie.OrderCount = movie.OrderCount + newOrder.count;
        } else {
            movie.OrderCount = newOrder.count;
        }
        context.log(`Updated movie called ${movie.ProductName} to order count: ${movie.OrderCount}`);
    });

    // Consider using the categoryId retrieved from the Items container to also lookup categories and 
    // bump its ordercount
    for (let index = 0; index < items.length; index++) {
        const movie = items[index];
        context.log(`Movie to update: ${JSON.stringify(movie)}`);
        const { id: id, ItemId: partitionKey } = movie;
        const { resource: updatedItem } = await container.item(id, partitionKey).replace(movie);
        context.log(`Updated movie ${movie.ProductName} in CosmosDB`);        
    }

    context.log("All done here :)");
    return;
};