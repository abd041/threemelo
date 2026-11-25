/** Source text stays in the worker. Transferable geometry is the rendering contract. */
export interface PackedToolpath {
 count:number; positions:Float32Array; speeds:Float32Array; types:Uint8Array; lines:Uint32Array;
 features:Uint8Array; tools:Uint16Array; nozzles:Float32Array; beds:Float32Array; layerIds:Uint32Array;
 layers:number[]; layerMode:'metadata'|'inferred'|'height'; layerConfidence:string;
 sourceLines:number; warnings:string[]; filament:number; filamentAvailable:boolean;
}
export type WorkerRequest =
 | {id:number;kind:'parse';file?:File;example?:string;options:{arcTolerance:number;firmware:'marlin'|'independent'}}
 | {id:number;kind:'source';start:number;count:number}
 | {id:number;kind:'search';query:string;start:number};
export type WorkerReply =
 | {id:number;kind:'status';phase:string}
 | {id:number;kind:'progress';processed:number;total:number}
 | {id:number;kind:'result';result:PackedToolpath;parseMs:number}
 | {id:number;kind:'source';start:number;total:number;rows:{line:number;text:string}[]}
 | {id:number;kind:'search';matches:number[];capped:boolean}
 | {id:number;kind:'error';error:string};
