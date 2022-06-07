import { Account, ApolloAccountQuery, ApolloChannelQuery, Channel, Dataset, RemoteStatus } from "../types";

var axios = require('axios');

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

enum Status {
    TypeError, NetworkError, OK
}

interface HoprNodeHeader {
    peerId: string
    multiAddr: string
    endpoint: string
}

interface HoprNode extends HoprNodeHeader {
    heartbeats: {
        sent: number,
        success: number
    },
    lastSeen: number,
    quality: number,
    backoff: number,
    isNew: boolean
}

interface PeerRequest {
    nodes: HoprNode[]
    status: Status
    error?: any
}

interface AccountRequest {
    account: Account
    status: Status
    error?: any
    node: HoprNodeHeader
}

export async function exploreLocalCluster(localNodeEndpoint: string, nodeToken: string, setRemoteStatus: React.Dispatch<React.SetStateAction<RemoteStatus>>, setRemoteError: React.Dispatch<React.SetStateAction<string>>): Promise<Dataset | undefined> {

    let responseData: PeerRequest
    let visitedMap: Map<string, HoprNodeHeader> = new Map()
    let toBeVisitedList: HoprNodeHeader[] = []


    responseData = await makePeerRequest(localNodeEndpoint, nodeToken)
    if (responseData.status != Status.OK && responseData.nodes != undefined) {
        setRemoteError(responseData.error)
        setRemoteStatus(RemoteStatus.errored)
        return
    }

    setRemoteStatus(RemoteStatus.connected)

    toBeVisitedList = toBeVisitedList.concat(responseData.nodes)

    //fetch all the nodes in the network
    try {
        while (toBeVisitedList.length > 0) {
            let node: HoprNodeHeader | undefined = toBeVisitedList.shift();
            if (node == undefined || visitedMap.has(node.peerId)) {
                continue
            }
            let endpoint = parseEndpoint(node)
            node.endpoint = endpoint
            let req = await makePeerRequest(endpoint, nodeToken)
            if (req.error != null) continue
            visitedMap.set(node.peerId, node)
            for (let i = 0; i < req.nodes.length; i++) {
                const element = req.nodes[i];
                if (element == undefined || visitedMap.has(element.peerId)) {
                    continue
                }
                toBeVisitedList = toBeVisitedList.concat(element)
            }

        }
    } catch (error) {
        setRemoteError(responseData.error)
        setRemoteStatus(RemoteStatus.errored)
        return
    }

    let dataset: Dataset = {
        nodes: [],
        edges: []
    }
    //build nodes and edges (Accounts and Channels) for each node of the network
    for (const peerId in visitedMap.keys()) {
        if (Object.prototype.hasOwnProperty.call(visitedMap.keys(), peerId)) {
            let node: Account
            let hoprNode = visitedMap.get(peerId)

        }
    }

    console.log(JSON.stringify(responseData));



    return undefined
}

async function makePeerRequest(localNodeEndpoint: string, nodeToken: string): Promise<PeerRequest> {

    let responseData: PeerRequest = {
        nodes: [],
        status: Status.OK
    }

    var config = {
        method: 'get',
        url: `http://${localNodeEndpoint}/api/v2/node/peers`,
        //url: `https://jsonplaceholder.typicode.com/posts`,
        headers: {
            'accept': 'application/json',
            'x-auth-token': nodeToken
        },
        timeout: 1000,
    };

    try {
        const { data } = await axios(config)
        try {
            data.announced.forEach((element: HoprNode) => {
                let hoprNode: HoprNode = {
                    peerId: element.peerId,
                    multiAddr: element.multiAddr,
                    heartbeats: {
                        sent: element.heartbeats.sent,
                        success: element.heartbeats.success
                    },
                    lastSeen: element.lastSeen,
                    quality: element.quality,
                    backoff: element.backoff,
                    isNew: element.isNew,
                    endpoint: localNodeEndpoint
                }
                responseData.nodes = responseData.nodes.concat(hoprNode)
            });
        } catch (error: any) {
            responseData.error = "Error while parsing the request. Is this a HOPR Node?"
            responseData.status = Status.TypeError
        }

    } catch (error: any) {
        responseData.error = error
        responseData.status = Status.NetworkError
    }

    return responseData
}

async function makeAccount(node: HoprNode, nodeToken: string): Promise<AccountRequest> {

    let account: AccountRequest = {
        account: {
            id: "",
            publicKey: "",
            balance: 0,
            openChannelsCount: 0,
            isActive: true
        },
        node: node,
        status: Status.OK
    }

    var config = {
        method: 'get',
        url: `http://${node.endpoint}/api/v2/node/peers`,
        //url: `https://jsonplaceholder.typicode.com/posts`,
        headers: {
            'accept': 'application/json',
            'x-auth-token': nodeToken
        },
        timeout: 1000,
    };

    return account
}

function parseEndpoint(node: HoprNodeHeader): string {
    let splitted = node.multiAddr.split("/")
    let ip = splitted[2]
    let port = parseInt(splitted[4]) % 10 + 13300 //changes port 190xx to 133xx
    return `${ip}:${port}`
}

