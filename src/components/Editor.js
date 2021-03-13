import React, {Component} from 'react';
import Tree from 'react-d3-tree';
import {version} from '../../package.json';
import Switch from './Switch';
import MixedNodeElement from './MixedNodeElement';
import PureSvgNodeElement from './PureSvgNodeElement';
import '../App.css';
// Data data
import data from './../data/data.json';
import {parseAncestryNotation, printAncestryNotation} from "../utils/TreeConverter";

const orgChartJson = data.tree;

const customNodeFnMapping = {
  svg: {
    description: 'Default - Pure SVG node & label (IE11 compatible)',
    fn: (rd3tProps, appState) => (
      <PureSvgNodeElement
        nodeDatum={rd3tProps.nodeDatum}
        toggleNode={rd3tProps.toggleNode}
        orientation={appState.orientation}
      />
    ),
  },
  mixed: {
    description: 'MixedNodeElement - SVG `circle` + `foreignObject` label',
    fn: ({nodeDatum, toggleNode}, appState) => (
      <MixedNodeElement
        nodeData={nodeDatum}
        triggerNodeToggle={toggleNode}
        foreignObjectProps={{
          width: appState.nodeSize.x,
          height: appState.nodeSize.y,
          x: -50,
          y: 50,
        }}
      />
    ),
  },
};

const countNodes = (count = 0, n) => {
  // Count the current node
  count += 1;

  // Base case: reached a leaf node.
  if (!n.children) {
    return count;
  }

  // Keep traversing children while updating `count` until we reach the base case.
  return n.children.reduce((sum, child) => countNodes(sum, child), count);
};

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: orgChartJson,
      totalNodeCount: countNodes(0, Array.isArray(orgChartJson) ? orgChartJson[0] : orgChartJson),
      title: 'My Family Tree',
      orientation: 'vertical',
      translateX: 200,
      translateY: 300,
      pathFunc: 'diagonal',
      collapsible: true,
      shouldCollapseNeighborNodes: false,
      initialDepth: 1,
      depthFactor: null,
      zoomable: true,
      zoom: 1,
      scaleExtent: {min: 0.1, max: 1},
      separation: {siblings: 2, nonSiblings: 2},
      nodeSize: {x: 200, y: 200},
      enableLegacyTransitions: false,
      transitionDuration: 500,
      renderCustomNodeElement: 'svg',
      styles: {
        nodes: {
          node: {
            circle: {
              fill: '#52e2c5',
            },
            attributes: {
              stroke: '#000',
            },
          },
          leafNode: {
            circle: {
              fill: 'transparent',
            },
            attributes: {
              stroke: '#000',
            },
          },
        },
      },
    };

    this.setTreeData = this.setTreeData.bind(this);
    this.setLargeTree = this.setLargeTree.bind(this);
    this.setTitle = this.setTitle.bind(this);
    this.setOrientation = this.setOrientation.bind(this);
    this.setPathFunc = this.setPathFunc.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleFloatChange = this.handleFloatChange.bind(this);
    this.toggleCollapsible = this.toggleCollapsible.bind(this);
    this.toggleZoomable = this.toggleZoomable.bind(this);
    this.setScaleExtent = this.setScaleExtent.bind(this);
    this.setSeparation = this.setSeparation.bind(this);
    this.setNodeSize = this.setNodeSize.bind(this);
  }

  setTreeData(data) {
    this.setState({
      data,
      totalNodeCount: countNodes(0, Array.isArray(data) ? data[0] : data),
    });
  }

  setLargeTree(data) {
    this.setState({
      data,
      transitionDuration: 0,
    });
  }

  setTitle(title) {
    this.setState({title});
  }

  setOrientation(orientation) {
    this.setState({orientation});
  }

  setPathFunc(pathFunc) {
    this.setState({pathFunc});
  }

  handleChange(evt) {
    const target = evt.target;
    const parsedIntValue = parseInt(target.value, 10);
    if (target.value === '') {
      this.setState({
        [target.name]: undefined,
      });
    } else if (!isNaN(parsedIntValue)) {
      this.setState({
        [target.name]: parsedIntValue,
      });
    }
  }

  handleFloatChange(evt) {
    const target = evt.target;
    const parsedFloatValue = parseFloat(target.value);
    if (target.value === '') {
      this.setState({
        [target.name]: undefined,
      });
    } else if (!isNaN(parsedFloatValue)) {
      this.setState({
        [target.name]: parsedFloatValue,
      });
    }
  }

  handleCustomNodeFnChange = evt => {
    const customNodeKey = evt.target.value;

    this.setState({renderCustomNodeElement: customNodeKey});
  };

  toggleCollapsible() {
    this.setState(prevState => ({collapsible: !prevState.collapsible}));
  }

  toggleCollapseNeighborNodes = () => {
    this.setState(prevState => ({
      shouldCollapseNeighborNodes: !prevState.shouldCollapseNeighborNodes,
    }));
  };

  toggleZoomable() {
    this.setState(prevState => ({zoomable: !prevState.zoomable}));
  }

  setScaleExtent(scaleExtent) {
    this.setState({scaleExtent});
  }

  setSeparation(separation) {
    if (!isNaN(separation.siblings) && !isNaN(separation.nonSiblings)) {
      this.setState({separation});
    }
  }

  setNodeSize(nodeSize) {
    if (!isNaN(nodeSize.x) && !isNaN(nodeSize.y)) {
      this.setState({nodeSize});
    }
  }

  componentDidMount() {
    const dimensions = this.treeContainer.getBoundingClientRect();
    this.setState({
      translateX: dimensions.width / 2.5,
      translateY: dimensions.height / 2,
    });
  }

  generateConfigs = () => ({
    title: this.state.title,
    orientation: this.state.orientation,
    translate: {x: this.state.translateX, y: this.state.translateY},
    pathFunc: this.state.pathFunc,
    renderCustomNodeElement: this.state.renderCustomNodeElement,
    collapsible: this.state.collapsible,
    initialDepth: this.state.initialDepth,
    zoomable: this.state.zoomable,
    zoom: this.state.zoom,
    scaleExtent: this.state.scaleExtent,
    nodeSize: this.state.nodeSize,
    separation: this.state.separation,
    enableLegacyTransitions: this.state.enableLegacyTransitions,
    transitionDuration: this.state.transitionDuration,
    depthFactor: this.state.depthFactor,
    styles: this.state.styles,
    shouldCollapseNeighborNodes: this.state.shouldCollapseNeighborNodes,
  });

  generateDataAndConfigurations = () => ({
    configurations: this.generateConfigs(),
    tree: this.state.data
  });

  render() {
    return (
      <div className="App">
        <div className="demo-container">
          <div className="column-left">
            <div className="controls-container">
              <div className="prop-container">
                <h2 className="title">Family Tree Editor</h2>
                <h3 className="title">v{version}</h3>

                <div className="prop-container">
                  <h3 className="prop">Save</h3>
                  Save your changes to avoid loosing your data.<br/>
                  <h5>Steps to save your changes</h5>
                  <ol>
                    <li>Create a copy of this website (you only need to do this once)</li>
                    <li>Copy all your changes using the 'Copy Tree & Configurations' button below</li>
                    <li>Open your <a
                      href={`${data.repositoryLink}/edit/master/src/data/data.json`}>data file</a> and
                      paste your changes there.<br/>
                      Finally, hit the 'Commit changes' button at the bottom.
                    </li>
                    <li>If all goes well, your changes should reflect in a few minutes once you refresh the page.</li>
                  </ol>
                  <textarea style={{width: '100%'}}
                            value={JSON.stringify(this.generateDataAndConfigurations(), null, 2)}
                            disabled={true}/>
                  <button
                    type="button"
                    className="btn btn-block"
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(this.generateDataAndConfigurations(), null, 2))}
                  >
                    {'Copy Tree & Configurations'}
                  </button>
                </div>

                <h4 className="prop">Ancestry</h4>
                <div style={{marginBottom: '5px'}}>
                  <textarea style={{width: '100%'}}
                            rows={12}
                            value={printAncestryNotation(this.state.data)}
                            onChange={(event) => this.setTreeData(parseAncestryNotation(event.target.value))}/>
                </div>
              </div>

              <div className="prop-container">
                <h3 className="prop">Configurations</h3>
                <h4 className="prop">Title</h4>
                <input
                  type="text"
                  value={this.state.title}
                  onChange={(event) => this.setTitle(event)}
                />
              </div>

              <div className="prop-container">
                <h4 className="prop">Orientation</h4>
                <button
                  type="button"
                  className="btn btn-controls btn-block"
                  onClick={() => this.setOrientation('horizontal')}
                >
                  {'Horizontal'}
                </button>
                <button
                  type="button"
                  className="btn btn-controls btn-block"
                  onClick={() => this.setOrientation('vertical')}
                >
                  {'Vertical'}
                </button>
              </div>

              <div className="prop-container">
                <h4 className="prop">Path Function</h4>
                <button
                  type="button"
                  className="btn btn-controls btn-block"
                  onClick={() => this.setPathFunc('diagonal')}
                >
                  {'Diagonal'}
                </button>
                <button
                  type="button"
                  className="btn btn-controls btn-block"
                  onClick={() => this.setPathFunc('elbow')}
                >
                  {'Elbow'}
                </button>
                <button
                  type="button"
                  className="btn btn-controls btn-block"
                  onClick={() => this.setPathFunc('straight')}
                >
                  {'Straight'}
                </button>
                <button
                  type="button"
                  className="btn btn-controls btn-block"
                  onClick={() => this.setPathFunc('step')}
                >
                  {'Step'}
                </button>
              </div>

              <div className="prop-container">
                <label className="prop" htmlFor="customNodeElement">
                  Custom Node Element
                </label>
                <select className="form-control" onChange={this.handleCustomNodeFnChange}>
                  {Object.entries(customNodeFnMapping).map(([key, {description}]) => (
                    <option key={key} value={key}>
                      {description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="prop-container">
                <h4 className="prop">Collapsible</h4>
                <Switch
                  name="collapsibleBtn"
                  checked={this.state.collapsible}
                  onChange={this.toggleCollapsible}
                />
              </div>

              <div className="prop-container">
                <h4 className="prop">Collapse neighbor nodes</h4>
                <Switch
                  name="collapseNeighborsBtn"
                  checked={this.state.shouldCollapseNeighborNodes}
                  onChange={this.toggleCollapseNeighborNodes}
                />
              </div>

              <div className="prop-container">
                <h4 className="prop">Enable Legacy Transitions</h4>
                <Switch
                  name="enableLegacyTransitionsBtn"
                  checked={this.state.enableLegacyTransitions}
                  onChange={() =>
                    this.setState(prevState => ({
                      enableLegacyTransitions: !prevState.enableLegacyTransitions,
                    }))
                  }
                />
              </div>

              <div className="prop-container">
                <div>
                  <label className="prop" htmlFor="translateX">
                    Translate X
                  </label>
                  <input
                    className="form-control"
                    name="translateX"
                    type="number"
                    value={this.state.translateX}
                    onChange={this.handleChange}
                  />
                </div>
                <div>
                  <label className="prop" htmlFor="translateY">
                    Translate Y
                  </label>
                  <input
                    className="form-control"
                    name="translateY"
                    type="number"
                    value={this.state.translateY}
                    onChange={this.handleChange}
                  />
                </div>
              </div>

              <div className="prop-container">
                <label className="prop" htmlFor="initialDepth">
                  Initial Depth
                </label>
                <input
                  className="form-control"
                  style={{color: 'grey'}}
                  name="initialDepth"
                  type="text"
                  value={this.state.initialDepth}
                  onChange={this.handleChange}
                />
              </div>

              <div className="prop-container">
                <label className="prop" htmlFor="depthFactor">
                  Depth Factor
                </label>
                <input
                  className="form-control"
                  name="depthFactor"
                  type="number"
                  defaultValue={this.state.depthFactor}
                  onChange={this.handleChange}
                />
              </div>

              {/* <div className="prop-container prop">{`Zoomable: ${this.state.zoomable}`}</div> */}

              <div className="prop-container">
                <label className="prop" htmlFor="zoom">
                  Zoom
                </label>
                <input
                  className="form-control"
                  name="zoom"
                  type="number"
                  defaultValue={this.state.zoom}
                  onChange={this.handleFloatChange}
                />
              </div>

              <div className="prop-container">
                <span className="prop prop-large">Scale Extent</span>
                <label className="sub-prop" htmlFor="scaleExtentMin">
                  Min
                </label>
                <input
                  className="form-control"
                  name="scaleExtentMin"
                  type="number"
                  defaultValue={this.state.scaleExtent.min}
                  onChange={evt =>
                    this.setScaleExtent({
                      min: parseFloat(evt.target.value),
                      max: this.state.scaleExtent.max,
                    })
                  }
                />
                <label className="sub-prop" htmlFor="scaleExtentMax">
                  Max
                </label>
                <input
                  className="form-control"
                  name="scaleExtentMax"
                  type="number"
                  defaultValue={this.state.scaleExtent.max}
                  onChange={evt =>
                    this.setScaleExtent({
                      min: this.state.scaleExtent.min,
                      max: parseFloat(evt.target.value),
                    })
                  }
                />
              </div>

              <div className="prop-container">
                <span className="prop prop-large">Node separation</span>
                <label className="sub-prop" htmlFor="separationSiblings">
                  Siblings
                </label>
                <input
                  className="form-control"
                  name="separationSiblings"
                  type="number"
                  defaultValue={this.state.separation.siblings}
                  onChange={evt =>
                    this.setSeparation({
                      siblings: parseFloat(evt.target.value),
                      nonSiblings: this.state.separation.nonSiblings,
                    })
                  }
                />
                <label className="sub-prop" htmlFor="separationNonSiblings">
                  Non-Siblings
                </label>
                <input
                  className="form-control"
                  name="separationNonSiblings"
                  type="number"
                  defaultValue={this.state.separation.nonSiblings}
                  onChange={evt =>
                    this.setSeparation({
                      siblings: this.state.separation.siblings,
                      nonSiblings: parseFloat(evt.target.value),
                    })
                  }
                />
              </div>

              <div className="prop-container">
                <span className="prop prop-large">Node size</span>
                <label className="sub-prop" htmlFor="nodeSizeX">
                  X
                </label>
                <input
                  className="form-control"
                  name="nodeSizeX"
                  type="number"
                  defaultValue={this.state.nodeSize.x}
                  onChange={evt =>
                    this.setNodeSize({x: parseFloat(evt.target.value), y: this.state.nodeSize.y})
                  }
                />
                <label className="sub-prop" htmlFor="nodeSizeY">
                  Y
                </label>
                <input
                  className="form-control"
                  name="nodeSizeY"
                  type="number"
                  defaultValue={this.state.nodeSize.y}
                  onChange={evt =>
                    this.setNodeSize({x: this.state.nodeSize.x, y: parseFloat(evt.target.value)})
                  }
                />
              </div>

              <div className="prop-container">
                <label className="prop" htmlFor="transitionDuration">
                  Transition Duration
                </label>
                <input
                  className="form-control"
                  name="transitionDuration"
                  type="number"
                  value={this.state.transitionDuration}
                  onChange={this.handleChange}
                />
              </div>
            </div>
          </div>

          <div className="column-right">
            <div className="tree-stats-container">
              Total nodes in tree: {this.state.totalNodeCount}
            </div>
            <div ref={tc => (this.treeContainer = tc)} className="tree-container">
              <Tree
                data={this.state.data}
                renderCustomNodeElement={
                  this.state.renderCustomNodeElement
                    ? rd3tProps => customNodeFnMapping[this.state.renderCustomNodeElement].fn(rd3tProps, this.state)
                    : undefined
                }
                rootNodeClassName="demo-node"
                branchNodeClassName="demo-node"
                orientation={this.state.orientation}
                translate={{x: this.state.translateX, y: this.state.translateY}}
                pathFunc={this.state.pathFunc}
                collapsible={this.state.collapsible}
                initialDepth={this.state.initialDepth}
                zoomable={this.state.zoomable}
                zoom={this.state.zoom}
                scaleExtent={this.state.scaleExtent}
                nodeSize={this.state.nodeSize}
                separation={this.state.separation}
                enableLegacyTransitions={this.state.enableLegacyTransitions}
                transitionDuration={this.state.transitionDuration}
                depthFactor={this.state.depthFactor}
                styles={this.state.styles}
                shouldCollapseNeighborNodes={this.state.shouldCollapseNeighborNodes}
                // onUpdate={(...args) => {console.log(args)}}
                onNodeClick={(...args) => {
                  console.log('onNodeClick');
                  console.log(args);
                }}
                onNodeMouseOver={(...args) => {
                  console.log('onNodeMouseOver', args);
                }}
                onNodeMouseOut={(...args) => {
                  console.log('onNodeMouseOut', args);
                }}
                onLinkClick={(...args) => {
                  console.log(args);
                }}
                onLinkMouseOver={(...args) => {
                  console.log('onLinkMouseOver', args);
                }}
                onLinkMouseOut={(...args) => {
                  console.log('onLinkMouseOut', args);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Editor;
