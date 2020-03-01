#!/usr/bin/env node
import tape from "tape"
import EventReader from "../event-reader.js"
import { EventEmitter} from "events"

tape( "no listener without an emitter", function( t){
	t.plan( 1)
	const reader= new EventReader()
	try{
		reader.listener("nope")
		t.fail("got a listener")
	}catch(ex){
		t.pass("properly failed to get a listener")
	}
})
