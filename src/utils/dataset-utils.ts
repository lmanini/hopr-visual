import { Accounts, ApolloAccountQuery, ApolloChannelQuery, Channels, Dataset, RemoteStatus } from "../types";

export function datasetBuilderAccount(query: ApolloAccountQuery, dataset: Dataset): Dataset {
    dataset.nodes = dataset.nodes.concat(...query.accounts)
    // console.log("Dataset: ", dataset)
    return dataset
}

export function datasetBuilderChannel(query: ApolloChannelQuery, dataset: Dataset): Dataset {
    dataset.edges = dataset.edges.concat(...query.channels)
    // console.log("Dataset: ", dataset)
    return dataset
}

export async function exploreLocalCluster(localNodeEndpoint: string, nodeToken: string, setRemoteStatus: React.Dispatch<React.SetStateAction<RemoteStatus>>, setRemoteError: React.Dispatch<React.SetStateAction<string>>): Promise<Dataset | undefined> {
    var axios = require('axios');

    var config = {
        method: 'get',
        url: `https://${localNodeEndpoint}/api/v2/node/peers`,
        headers: {
            'accept': 'application/json',
            'x-auth-token': nodeToken
        },
        timeout: 1000
    };

    let responseData: any

    try {
        const { data: responseData } = await axios(config)
    } catch (error: any) {
        setRemoteError(error)
        setRemoteStatus(RemoteStatus.errored)
    }

    if (responseData != undefined) {
        setRemoteStatus(RemoteStatus.connected)
    }

    console.log(JSON.stringify(responseData));

    return undefined
}

