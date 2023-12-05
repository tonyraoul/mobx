import {
    IObservableArray,
    IObservableValue,
    Lambda,
    ObservableMap,
    getAdministration,
    ObservableSet,
    die,
    isStringish,
    $mobx,
    MobXTypes
} from "../internal"

export type ReadInterceptor<T> = (value: any) => T

/** Experimental feature right now, tested indirectly via Mobx-State-Tree */
export function interceptReads<T>(value: IObservableValue<T>, handler: ReadInterceptor<T>): Lambda
export function interceptReads<T>(
    observableArray: IObservableArray<T>,
    handler: ReadInterceptor<T>
): Lambda
export function interceptReads<K, V>(
    observableMap: ObservableMap<K, V>,
    handler: ReadInterceptor<V>
): Lambda
export function interceptReads<V>(
    observableSet: ObservableSet<V>,
    handler: ReadInterceptor<V>
): Lambda
export function interceptReads(
    object: Object,
    property: string,
    handler: ReadInterceptor<any>
): Lambda
export function interceptReads(thing, propOrHandler?, handler?): Lambda {
    let target
    switch (thing[$mobx]?.mobxType || thing.mobxType) {
        case MobXTypes.OBSERVABLE_MAP:
        case MobXTypes.OBSERVABLE_ARRAY:
        case MobXTypes.OBSERVABLE_VALUE:
            target = getAdministration(thing)
            break;
        case MobXTypes.OBSERVABLE_OBJECT:
        case MobXTypes.OBSERVABLE_OBJECT_ADMINISTRATION:
            if (__DEV__ && !isStringish(propOrHandler)) {
              return die(
                `InterceptReads can only be used with a specific property, not with an object in general`
              )
            }
            target = getAdministration(thing, propOrHandler)
            break;
        default:
            if (__DEV__) {
                return die(`Expected observable map, object or array as first array`)
            }
    }
    if (__DEV__ && target.dehancer !== undefined) {
        return die(`An intercept reader was already established`)
    }
    target.dehancer = typeof propOrHandler === "function" ? propOrHandler : handler
    return () => {
        target.dehancer = undefined
    }
}
