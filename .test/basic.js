#!/usr/bin/env node
/** @module - tests of basic functionality */

import tape from "tape"
import FanOut from "../fan-out.js"

tape( "listeners capture latter events", async function( t){
	const fanOut= new FanOut()
	fanOut._startIterator= FanOut.Iterator.StartAll
	// send the event
	fanOut.push( "exemplary")

	// now iterate it
	const
		iter= fanOut[ Symbol.asyncIterator](),
		first= iter.next()
	t.deepEqual( await first, { value: "exemplary", done: false})
	t.end()
})

tape( "can end iteration", async function( t){
	t.plan( 2)
	const
		fanOut= new FanOut(),
		iter= fanOut[ Symbol.asyncIterator]()

	// first value
	const first= iter.next()
	iter.return()

	t.deepEqual( await first,{ value: undefined, done: true})
	t.equal( fanOut.iterators.length, 0, "iterators.length=0")
	t.end()
})

tape( "can for-await loop", async function( t){
	t.plan( 3)
	const
		fanOut= new FanOut(),
		iter= fanOut[ Symbol.asyncIterator]()

	;(async function(){
		let expected= [ 2, 4]
		for await( let value of iter){
			const next= expected.shift()
			t.equal( value, next, `value=${next}`)
		}
		t.equal( expected.length, 0, "no more expected")
		t.end()
	})();

	fanOut.push( 2)
	fanOut.push( 4)
	await (new Promise(res => setTimeout(res, 0)));
	fanOut.end()
})

tape( "multiple consumers", async function( t){
	t.plan( 6)
	const fanOut= new FanOut()

	async function doReader( name, type= "number"){
		let expected= [ 3, 6]
		for await( let value of fanOut){
			const next= expected.shift()
			t.equal( value, next, `${name} value=${next}`)
		}
		t.equal( expected.length, 0, `${name} no more expected`)
	}
	// this is what this library was actually written to do
	doReader("a")
	doReader("b")

	fanOut.push( 3)
	fanOut.push( 6)
	await (new Promise(res => setTimeout(res, 0)));
	fanOut.end()
})
