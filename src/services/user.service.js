import { storageService } from './async-storage.service'

const STORAGE_KEY_LOGGEDIN_USER = 'loggedinUser'

export const userService = {
    login,
    logout,
    signup,
    getLoggedinUser,
    saveLocalUser,
    getUsers,
    getById,
    remove,
    update,
    changeScore
}

const PBKDF2_ITERATIONS = 210000

async function getUsers() {
    const users = await storageService.query('user')
    return users.map(_toPublicUser)
    // return httpService.get(`user`)
}



async function getById(userId) {
    const user = await storageService.get('user', userId)
    // const user = await httpService.get(`user/${userId}`)
    return _toPublicUser(user)
}

function remove(userId) {
    const loggedinUser = getLoggedinUser()
    if (!loggedinUser?.isAdmin && loggedinUser?._id !== userId) throw new Error('Not authorized')
    return storageService.remove('user', userId)
    // return httpService.delete(`user/${userId}`)
}

async function update({ _id, score }) {
    const loggedinUser = getLoggedinUser()
    if (!loggedinUser) throw new Error('Not loggedin')
    if (!loggedinUser.isAdmin && loggedinUser._id !== _id) throw new Error('Not authorized')
    if (typeof score !== 'number' || !Number.isFinite(score)) throw new Error('Invalid score')

    const user = await storageService.get('user', _id)
    user.score = score
    await storageService.put('user', user)

    // const user = await httpService.put(`user/${_id}`, {_id, score})

    // When admin updates other user's details, do not update loggedinUser
    if (loggedinUser._id === user._id) saveLocalUser(user)
    return user
}

async function login(userCred) {
    const { username, password } = _validateCred(userCred)
    const users = await storageService.query('user')
    const user = users.find(user => user.username === username)
    // const user = await httpService.post('auth/login', userCred)
    if (!user || !user.passwordHash || !user.passwordSalt) throw new Error('Invalid username or password')

    const hash = await _hashPassword(password, user.passwordSalt)
    if (!_isEqual(hash, user.passwordHash)) throw new Error('Invalid username or password')
    return saveLocalUser(user)
}

async function signup(userCred) {
    const { username, password } = _validateCred(userCred)
    const users = await storageService.query('user')
    if (users.some(user => user.username === username)) throw new Error('Username already taken')

    const passwordSalt = _makeSalt()
    const passwordHash = await _hashPassword(password, passwordSalt)
    const user = await storageService.post('user', {
        username,
        passwordHash,
        passwordSalt,
        fullname: _sanitizeText(userCred.fullname) || username,
        imgUrl: _sanitizeImgUrl(userCred.imgUrl),
        score: 10000,
        isAdmin: false,
    })
    // const user = await httpService.post('auth/signup', userCred)
    return saveLocalUser(user)
}

async function logout() {
    sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
    // return await httpService.post('auth/logout')
}

async function changeScore(by) {
    const user = getLoggedinUser()
    if (!user) throw new Error('Not loggedin')
    user.score = user.score + by || by
    await update(user)
    return user.score
}


function saveLocalUser(user) {
    user = { _id: user._id, fullname: user.fullname, imgUrl: user.imgUrl, score: user.score, isAdmin : user.isAdmin }
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user))
    return user
}

function getLoggedinUser() {
    try {
        return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER))
    } catch {
        sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
        return null
    }
}

function _toPublicUser(user) {
    return { _id: user._id, username: user.username, fullname: user.fullname, imgUrl: user.imgUrl, score: user.score, isAdmin: user.isAdmin }
}

function _validateCred(userCred) {
    const username = (typeof userCred?.username === 'string') ? userCred.username.trim() : ''
    const password = (typeof userCred?.password === 'string') ? userCred.password : ''
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) throw new Error('Invalid username')
    if (password.length < 8 || password.length > 128) throw new Error('Password must be 8-128 characters')
    return { username, password }
}

function _sanitizeText(txt, maxLength = 100) {
    if (typeof txt !== 'string') return ''
    return txt.trim().slice(0, maxLength)
}

function _sanitizeImgUrl(imgUrl) {
    const DEFAULT_IMG_URL = 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'
    if (typeof imgUrl !== 'string' || !imgUrl) return DEFAULT_IMG_URL
    try {
        const url = new URL(imgUrl, window.location.origin)
        return (url.protocol === 'https:' || url.protocol === 'http:') ? url.href : DEFAULT_IMG_URL
    } catch {
        return DEFAULT_IMG_URL
    }
}

function _makeSalt() {
    return _toHex(crypto.getRandomValues(new Uint8Array(16)))
}

async function _hashPassword(password, salt) {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: encoder.encode(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        key,
        256
    )
    return _toHex(new Uint8Array(bits))
}

function _toHex(bytes) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

function _isEqual(a, b) {
    if (a.length !== b.length) return false
    let diff = 0
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
    return diff === 0
}






