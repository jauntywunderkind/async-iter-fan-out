import FanOut from "./event-reader.js"

/** create a new class derived from `klass` that mixes in `FanOut` */
export function mixonFanOutType( klass, mapArgs){
	const mixed= ({[ klass.name]: class extends klass{
		constructor( ...arg){
			let mappedArgs
			super(...(( mappedArgs= mapArgs&& mapArgs( arg)|| [ arg, arg])[ 0]))
			FanOut.call( this, ...(mappedArgs[ 1]|| []))
			return this
		}
	}})[ klass.name]
	const props= Object.getOwnPropertyDescriptors( FanOut.prototype)
	Object.defineProperties( mixed.prototype, props)
	return mixed
}
export default mixinFanOutType
