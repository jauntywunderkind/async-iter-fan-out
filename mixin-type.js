/** create a new class derived from `klass` that mixes in `EventReader` */
export function mixinEventReaderType( klass){
	const mixed= ({[ klass.name]: class extends klass{
		constructor( ...arg){
			if( this._onArg){
				const [superArg, readerArg] = this._onArg.call( this, ...arg)
			}
			constructor.super_.call( this, ...(superArg|| []))
			EventReader.call( this, ..(readerArg|| []))
		}
	}})[ klass.name]
	const props= Object.getOwnPropertyDescriptors( EventReader.prototype)
	Object.defineProperties( mixed.prototype, props)
	throw new Error("Not implemented")
}
export default mixinEventReader
