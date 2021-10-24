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

//Converting the array to a data structure that, for each place, can tell us what can be reached from there.
//Given an array of edges, the buildGraph function creates a map object that, for each node, stores an array of connected nodes.
//It uses the split method to go from the road strings, which have the form "Start=End", to two-element arrays containing the start and end as a separate string.

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

/*
Our robot will be moving around the village. There are parcels in various places, each addressed to some other place. The robot picks up parcels when it comes to them
and delivers them when it arrives at their next destination. The robot mmust decide, at each point, where to go next.
It has finished its task when the last parcel is delvered.

Let's condense the village's state down to the values that define it. There's the robot's current location and the collection of undelivered parcels,
each of which has a current location and a destination address. That's it.

We'll make it so we don't CHANGE this state when the robot moves but rather compute a NEW state for the situation after the move.
*/

class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination) {
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    } else {
      let parcels = this.parcels.map(p => {
        if (p.place != this.place) return p;
        return { place: destination, address: p.address };
      }).filter(p => p.place != p.address);
      return new VillageState(destination, parcels);
    }
  }
}

/*
The move method is where the action happens. It first checks whether there is a road going from the current place to the destination,
and if not, it returns the old state since this isn't a valid move.
Then it creates a new state with the destination as the robot's new place. It also needs to create a new set of parcels -- parcels that the robot is carrying
(that are at the robot's current place) need to be moved along to the new place. And parcels that are addressed to the new place need to be delivered -- that is,
they need to be removed from the set of undelivered parcels The call to MAP takes care of the moving, and the call to FILTER does the delivering.
Parcel objects aren't changed when they are moved but at recreated. The MOVE method gives us a new village state but leaves the old one entirely.
*/

let first = new VillageState(
  "Post Office",
  [{place: "Post Office", address: "Alice's House"}]
);
let next = first.move("Alice's House");

/*
Robot is a function that takes a VillageState and return the name of a nearby place. The thing the robot returns is
an object continaing both the direction it wants to move and a memory value that will be given back to it the next time it is called.
 */

function runRobot(state, robot, memory) {
  for (let turn = 0;; turn ++) {
    if (state.parcels == 0) {
      console.log(`Done in ${turn} turns.`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    console.log(`Moved to ${action.direction}`);
  }
}

/*
In order to solve a given state, the robot must pick up all parcels by visiting every location that has a parcel and deliver them by visiting
every location that a parcel is addressed to, but only after picking up the parcel.
*/

function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

function randomRobot(state) {
  return {direction: randomPick(roadGraph[state.place])};
}

//Create a new state with some parcels

VillageState.random = function(parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph));
    let place;
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({place, address});
  }
  return new VillageState("Post Office", parcels);
}

runRobot(VillageState.random(), randomRobot);

// We should be able to do better than a random robot. An easy improvement would be to find a route that passes all places in the village and run that route
