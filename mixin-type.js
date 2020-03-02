import EventReader from "./event-reader.js"

/** create a new class derived from `klass` that mixes in `EventReader` */
export function mixinEventReaderType( klass, mapArgs){
	const mixed= ({[ klass.name]: class extends klass{
		constructor( ...arg){
			let mappedArgs
			super(...(( mappedArgs= mapArgs&& mapArgs( arg)|| [ arg, arg])[ 0]))
			EventReader.call( this, ...(mappedArgs[ 1]|| []))
		}
	}})[ klass.name]
	const props= Object.getOwnPropertyDescriptors( EventReader.prototype)
	Object.defineProperties( mixed.prototype, props)
	return mixed
}
export default mixinEventReaderType
