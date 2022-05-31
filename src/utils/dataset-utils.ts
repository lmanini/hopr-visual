import { Accounts, ApolloQuery, Channels, Dataset } from "../types";

export function datasetBuilder(query: ApolloQuery | undefined): Dataset {
    let dataset: Dataset = {
        nodes: [],
        edges: []
    }
    if (query == undefined) {
        return dataset
    }
    // for (let i = 0; i < query.account.length; i++) {
    //     let account: Accounts = {
    //         id: query.account[i].id,
    //         publicKey: query.account[i].publicKey,
    //         balance: query.account[i].balance,
    //         openChannelsCount: query.account[i].openChannelsCount,
    //         isActive: query.account[i].isActive
    //     }
    //     dataset.nodes.concat(account)
    // }
    dataset.nodes = dataset.nodes.concat(...query.accounts)
    dataset.edges = dataset.edges.concat(...query.channels)
    console.log("Dataset: ", dataset)
    return dataset
}