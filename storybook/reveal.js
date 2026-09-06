// Seasonal changes share the gentle scale transition used by the blossom trees.
export function createReveal(animate=()=>true){
 const states=new WeakMap();
 return function reveal(object,show,multiplier=1){
  const target=show?1:0;
  let state=states.get(object);
  if(!state){state={amount:target,base:object.scale.clone()};states.set(object,state);}
  const difference=target-state.amount;
  state.amount=!animate()||Math.abs(difference)<.002?target:state.amount+difference*.14;
  object.scale.copy(state.base).multiplyScalar(Math.max(.0001,state.amount)*multiplier);
  object.visible=state.amount>.001;
  return state.amount!==target;
 };
}
