# React Hopr Visualizer based on Sigma.js
## Aim of this project
Provide a visual representation of the Hopr Network and allow developers to easily draw a local cluster
## Methodology
We can divide the application in 2 parts, as prescribed by Sigma.js
- Dataset building
- Graphical representation of the dataset

the latter is taken care by Sigma.js meanwhile in the first part we needed to implement the logic to compute nodes and edges of the network.
We divided this logic in two sections
- TheGraph dataset
- LocalCluster dataset

For the first, having to deal with thousands of nodes and edges, we decided to leave all the computation to TheGraph which provides us with the computed Hopr Accounts and Channels, properly filtered (we only take nodes that have > 1 edge) and included of all the necessary information (addresses, balances, ...). The implementation of this part can be found on https://github.com/eliaxie/hopr-community For the second part, dealing with a much smaller volume we could tackle the problem directly (also, these clusters are often running on local forks so we couldn't possibly use TheGraph). In this case, we apply an iterative approach where we ask the user for the endpoint and token of one node of the cluster and via Hopr Rest APIs we make a series of calls to the local node and all the peers connected, trying to find all the announced nodes of the network. Once we have all the nodes, we ask each node for its balance informations and all the outgoing channels. At this point, the only thing remaining is to connect the nodes together and give it to the graph engine to be drawn on the screen.


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:5000](http://localhost:5000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
