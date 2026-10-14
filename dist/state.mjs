/** Serializable story state. Continuous motion does not update this state per frame. */
export const initialState=()=>({opened:false,revisions:[false,false,false],letter:'proposal'});
export function documentReducer(state,event){
  switch(event.type){
    case 'OPEN':return {...state,opened:true};
    case 'REVISE':{
      if(!Number.isInteger(event.index)||event.index<0||event.index>2)return state;
      return {...state,revisions:state.revisions.map((v,i)=>i===event.index?!v:v)};
    }
    case 'REVISION_PASS':{
      const pass=Math.max(0,Math.min(3,Math.round(Number(event.value)||0)));
      return {...state,revisions:[0,1,2].map(i=>i<pass)};
    }
    case 'MAKE_LETTER':return state.letter==='proposal'?{...state,letter:'assembling'}:state;
    case 'LETTER_READY':return state.letter==='assembling'?{...state,letter:'ready'}:state;
    case 'REPLAY':return initialState();
    default:return state;
  }
}
