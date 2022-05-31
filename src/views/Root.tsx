import React, { FC, useEffect, useState } from "react";
import { SigmaContainer, ZoomControl, FullScreenControl } from "react-sigma-v2";
import { omit, mapValues, keyBy, constant } from "lodash";
import { ApolloClient, InMemoryCache, gql, useLazyQuery } from '@apollo/client'

import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";

import GraphSettingsController from "./GraphSettingsController";
import GraphEventsController from "./GraphEventsController";
import GraphDataController from "./GraphDataController";
import DescriptionPanel from "./DescriptionPanel";
import { ApolloQuery, Cluster, Dataset, DatasetMap, FiltersState, NodeData, NodeWithStats, Tag } from "../types";
import ClustersPanel from "./ClustersPanel";
import SearchField from "./SearchField";
import drawLabel from "../canvas-utils";
import GraphTitle from "./GraphTitle";
import TagsPanel from "./TagsPanel";
import { datasetBuilder } from "../utils/dataset-utils"

import "react-sigma-v2/lib/react-sigma-v2.css";
import { GrClose } from "react-icons/gr";
import { BiRadioCircleMarked, BiBookContent } from "react-icons/bi";
import { BsArrowsFullscreen, BsFullscreenExit, BsZoomIn, BsZoomOut } from "react-icons/bs";
import { ethers } from "ethers";

const APIURL = 'https://api.thegraph.com/subgraphs/name/eliaxie/hopr-channels'
const client = new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache(),
})

const Root: FC = () => {
  const [showContents, setShowContents] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [filtersState, setFiltersState] = useState<FiltersState>({
    clusters: {},
    tags: {},
  });



  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const GET_ACCOUNTS = gql`
  query getAccounts {
    accounts(first: 1000, where:{isActive: true}) {
      id
      publicKey
      balance
      openChannelsCount
      isActive
    }
  }
  `;
  const GET_CHANNELS = gql`
  query getChannels($skipCycle: Int!) {
    channels(first: 1000, skip: $skipCycle, where: {status: OPEN}) {
      id
      source {
        id
      }
      destination {
        id
      }
      balance
      commitment
      channelEpoch
      ticketEpoch
      ticketIndex
      status
      commitmentHistory
    }
  }
`;
  const [queryApollo, { loading, error, data }] = useLazyQuery<ApolloQuery>(GET_CHANNELS, { client, pollInterval: 5000 });

  useEffect(() => {

    queryApollo({ variables: { skipCycle: 2000 } })

    if (loading) {
      console.log("loading...")
      return
    }

    if (error) {
      console.log("Error: ", error)
      return;
    }

    if (data) {
      console.log("Data: ", data);
      let dataset: Dataset = datasetBuilder(data)
      setDataset(dataset)
      requestAnimationFrame(() => setDataReady(true));
    }
  }, [loading])

  if (!dataset) return null;

  return (
    <div id="app-root" className={showContents ? "show-contents" : ""}>
      <SigmaContainer
        graphOptions={{ type: "directed" }}
        initialSettings={{
          nodeProgramClasses: { image: getNodeProgramImage() },
          labelRenderer: drawLabel,
          defaultNodeType: "image",
          defaultEdgeType: "arrow",
          renderEdgeLabels: true,
          labelDensity: 0.07,
          labelGridCellSize: 60,
          labelRenderedSizeThreshold: 15,
          labelFont: "Lato, sans-serif",
          zIndex: true,
        }}
        className="react-sigma"
      >
        <GraphSettingsController hoveredNode={hoveredNode} />
        <GraphEventsController setHoveredNode={setHoveredNode} />
        <GraphDataController dataset={dataset} filters={filtersState} />
        {!dataReady && (<>Loading data...</>)}
        {dataReady && (
          <>
            <div className="controls">
              <div className="ico">
                <button
                  type="button"
                  className="show-contents"
                  onClick={() => setShowContents(true)}
                  title="Show caption and description"
                >
                  <BiBookContent />
                </button>
              </div>
              <FullScreenControl
                className="ico"
                customEnterFullScreen={<BsArrowsFullscreen />}
                customExitFullScreen={<BsFullscreenExit />}
              />
              <ZoomControl
                className="ico"
                customZoomIn={<BsZoomIn />}
                customZoomOut={<BsZoomOut />}
                customZoomCenter={<BiRadioCircleMarked />}
              />
            </div>
            <div className="contents">
              <div className="ico">
                <button
                  type="button"
                  className="ico hide-contents"
                  onClick={() => setShowContents(true)}
                  title="Show caption and description"
                >
                  <GrClose />
                </button>
              </div>
              <GraphTitle filters={filtersState} />

              <div className="panels">
                <SearchField filters={filtersState} />
                {/*<DescriptionPanel />
                <ClustersPanel
                  clusters={clusters}
                  filters={filtersState}
                  setClusters={(clusters) =>
                    setFiltersState((filters) => ({
                      ...filters,
                      clusters,
                    }))
                  }
                  toggleCluster={(cluster) => {
                    setFiltersState((filters) => ({
                      ...filters,
                      clusters: filters.clusters[cluster]
                        ? omit(filters.clusters, cluster)
                        : { ...filters.clusters, [cluster]: true },
                    }));
                  }}
                />
                <TagsPanel
                  tags={tags}
                  filters={filtersState}
                  setTags={(tags) =>
                    setFiltersState((filters) => ({
                      ...filters,
                      tags,
                    }))
                  }
                  toggleTag={(tag) => {
                    setFiltersState((filters) => ({
                      ...filters,
                      tags: filters.tags[tag] ? omit(filters.tags, tag) : { ...filters.tags, [tag]: true },
                    }));
                  }}
                />*/}
              </div>
            </div>
          </>
        )}
      </SigmaContainer>
    </div>
  );
};

export default Root;
