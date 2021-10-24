//Setting up the array with our town of Meadowfield, which has 11 locations with 14 roads between them.
//This network of roads forms a graph, which is a collection of points (places in the village) with lines between them (roads).

const roads = [
  "Alice's House-Bob's House",   "Alice's House-Cabin",
  "Alice's House-Post Office",   "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop",          "Marketplace-Farm",
  "Marketplace-Post Office",     "Marketplace-Shop",
  "Marketplace-Town Hall",       "Shop-Town Hall"
];

//Converting the array to a data structure that, for each place, can tell us what can be reached from there
//Given an array of edges, the buildGraph function creates a map object that, for each node, stores an array of connected nodes
//It uses the split method to go from the road strings, which have the form "Start=End", to two-element arrays containing the start and end as a separate string

function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }
  for (let [from, to] of edges.map(r => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

const roadGraph = buildGraph(roads);

console.log(roadGraph);
