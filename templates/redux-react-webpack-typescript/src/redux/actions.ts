export enum Action {
   INCREMENT_COUNTER
}

export function addAction(value: number){
   return { type: Action.INCREMENT_COUNTER, value };
}