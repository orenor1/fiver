// Shared pub/sub listener registry.
// Backs both the event-bus and the dummy socket service so the
// on/off/emit-over-a-map-of-listeners pattern lives in one place.
export function createListeners() {
    const listenersMap = {}

    function on(evName, listener) {
        listenersMap[evName] = [...(listenersMap[evName] || []), listener]
        return () => off(evName, listener)
    }

    function off(evName, listener = null) {
        if (!listenersMap[evName]) return
        if (!listener) delete listenersMap[evName]
        else listenersMap[evName] = listenersMap[evName].filter(func => func !== listener)
    }

    function emit(evName, data) {
        const listeners = listenersMap[evName]
        if (!listeners) return
        listeners.forEach(listener => listener(data))
    }

    function clear() {
        Object.keys(listenersMap).forEach(key => delete listenersMap[key])
    }

    return { listenersMap, on, off, emit, clear }
}
