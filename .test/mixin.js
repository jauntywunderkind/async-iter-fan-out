#!/usr/bin/env node
import { EventEmitter} from "events"
import tape from "tape"
import EventReader from "../event-reader.js"

tape( "event emitter mixin", async function( t){
	t.plan( )
	const
		Mixed= await EventReader.mixinType( EventEmitter),
		reader= new Mixed()

	;(async function(){
		const expect= [ 3, 4]
		for await( let value of reader.iterator( "number")){
			const next= expect.shift()
			t.equal( value, next, `value=${next}`)
		}
		t.equal( expect.length, 0, "no more expected")
		t.end()
	})()

	reader.emit( "number", 3)
	reader.emit( "number", 4)
	await new Promise(res => setTimeout( res, 0))
	reader.listeners.number.end()
})
