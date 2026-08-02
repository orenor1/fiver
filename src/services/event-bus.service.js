import { createListeners } from './listeners.service'

export const SHOW_MSG = 'show-msg'

const { on, emit } = createListeners()

export const eventBus = { on, emit }

export function showUserMsg(msg) {
    eventBus.emit(SHOW_MSG, msg)
}

export function showSuccessMsg(txt) {
    showUserMsg({txt, type: 'success'})
}
export function showErrorMsg(txt) {
    showUserMsg({txt, type: 'error'})
}

window.showUserMsg = showUserMsg
