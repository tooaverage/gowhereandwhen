// Suggested stays are editorial allocations, not proportional weather weights.
const plans={
 3:[['Paris',2]],
 7:[['Paris',4],['Lyon',2]],
 14:[['Paris',4],['Strasbourg',3],['Lyon',3],['Nice',3]],
 30:[['Paris',5],['Bayeux',3],['Tours',3],['Bordeaux',4],['Avignon',4],['Nice',4],['Lyon',3],['Strasbourg',3]]
};
const stops=[
 {name:'Paris',lat:48.8566,lng:2.3522,p:'Museums and neighbourhoods. Leave time for a day trip.'},
 {name:'Bayeux',lat:49.2765,lng:-.7031,p:'Your Normandy base for D-Day sites. Book local transport or a tour.'},
 {name:'Tours',lat:47.3941,lng:.6848,p:'Your Loire Valley base for castles. Plan transport to each château.'},
 {name:'Bordeaux',lat:44.8378,lng:-.5792,p:'Riverfront walks, wine and a day in Saint-Émilion.'},
 {name:'Avignon',lat:43.9493,lng:4.8055,p:'Your Provence base for the palace, Arles and nearby towns.'},
 {name:'Nice',lat:43.7102,lng:7.262,p:'Old-town walks and Riviera day trips. Beach plans depend on the season.'},
 {name:'Lyon',lat:45.764,lng:4.8357,p:'Food markets, the old town and river walks.'},
 {name:'Strasbourg',lat:48.5734,lng:7.7521,p:'Explore Alsace from here. Add Colmar; check Christmas market dates.'}
];
const legs={
 'Paris|Lyon':'Train to Lyon', 'Paris|Strasbourg':'Train to Strasbourg',
 'Strasbourg|Lyon':'Train to Lyon', 'Lyon|Nice':'Train to Nice',
 'Paris|Bayeux':'Train to Bayeux, Normandy',
 'Bayeux|Tours':'Via Paris; allow time to change stations',
 'Tours|Bordeaux':'Train via Saint-Pierre-des-Corps',
 'Bordeaux|Avignon':'Long rail journey; check changes',
 'Avignon|Nice':'Train to Nice; check changes',
 'Nice|Lyon':'Train to Lyon', 'Lyon|Strasbourg':'Train to Strasbourg'
};
module.exports={plans,stops,legs};
