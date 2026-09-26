// Route destinations are chosen for travel interest; climate is added afterward.
const extra=require('../climate/france-route.json');
const {stops}=require('./france-route-plan.cjs');
module.exports=record=>({...record,cities:stops.map(stop=>{
 const city=[...record.cities,...extra].find(c=>c.name===stop.name);
 if(!city)throw Error('Missing France destination data: '+stop.name);
 return {...city};
})});
