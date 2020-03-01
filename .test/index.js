#!/usr/bin/env node
import tape from "tape"
import EventReader from "../event-reader.js"
import { EventEmitter} from "events"

tape( "fails without emitter", function( t){
	t.plan( 1)
	const reader= new EventReader()
	try{
		reader.listener("nope")
		t.fail("got a listener")
	}catch(ex){
		t.pass("properly failed to get a listener")
	}
})

tape( "provide `emitter` to constructor", function( t){
	const
		emitter= new EventEmitter(),
		reader= new EventReader({ emitter})
	reader.listener( "example")
	t.end()
})

tape( "get an iterator", function( t){
	const
		emitter= new EventEmitter(),
		reader= new EventReader({ emitter}),
		iter= reader.iterator( "example")
	t.end()
})

tape( "iterator can see an event", async function( t){
	const
		emitter= new EventEmitter(),
		reader= new EventReader({ emitter}),
		iter= reader.iterator( "example"),
		first= iter.next()
	emitter.emit( "example", "exemplary")
	t.deepEqual( await first, { value: "exemplary", done: false})
	t.end()
})

tape( "listeners capture latter events", async function( t){
	const
		emitter= new EventEmitter(),
		reader= new EventReader({ emitter})
	// create listener
	reader.listener( "example")
	// send the event
	emitter.emit( "example", "exemplary")

	// now iterate it
	const
		iter= reader.iterator( "example"),
		first= iter.next()
	t.deepEqual( await first, { value: "exemplary", done: false})
	t.end()
})
