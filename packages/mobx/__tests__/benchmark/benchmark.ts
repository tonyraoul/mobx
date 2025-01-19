import { assertEquals } from "@std/assert"
import * as mobx from "../../dist/mobx.cjs.production.min.cjs"

function voidObserver() {
    // nothing, nada, noppes.
}

const observable = mobx.observable
const computed = mobx.computed

Deno.bench("one observes ten thousand that observe one - started", bench => {
    const a = observable.box(2)

    // many observers that listen to one..
    const observers: any[] = []
    for (let i = 0; i < 10000; i++) {
        ;(function (idx) {
            observers.push(
                computed(function () {
                    return a.get() * idx
                })
            )
        })(i)
    }

    // let bCalcs = 0
    // one observers that listens to many..
    const b = computed(function () {
        let res = 0
        for (let i = 0; i < observers.length; i++) res += observers[i].get()
        // bCalcs += 1
        return res
    })

    bench.start()

    mobx.observe(b, voidObserver, true) // start observers
    assertEquals(99990000, b.get())
    bench.end()
})

Deno.bench("one observes ten thousand that observe one - update", bench => {
    const a = observable.box(2)

    // many observers that listen to one..
    const observers: any[] = []
    for (let i = 0; i < 10000; i++) {
        ;(function (idx) {
            observers.push(
                computed(function () {
                    return a.get() * idx
                })
            )
        })(i)
    }

    // let bCalcs = 0
    // one observers that listens to many..
    const b = computed(function () {
        let res = 0
        for (let i = 0; i < observers.length; i++) res += observers[i].get()
        // bCalcs += 1
        return res
    })

    mobx.observe(b, voidObserver, true) // start observers
    bench.start()

    a.set(3)
    assertEquals(149985000, b.get()) // yes, I verified ;-).
    //t.equal(2, bCalcs);

    bench.end()
})
