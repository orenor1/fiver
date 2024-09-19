import React from 'react'
import { Routes, Route } from 'react-router'

import { NoLoginHomePage } from './pages/NoLoginHomePage'

import { AppHeader } from './cmps/AppHeader'
import { AppFooter } from './cmps/AppFooter'

// import {getById} from './services/user.service'

export function RootCmp() {
    const user = null // userService.getById(0);

    return (
        <div>
            <AppHeader />
            <main>
                <Routes>
                  { !user &&  <Route path="" element={<NoLoginHomePage />} />}
                  { user &&  <Route path="" element={<HomePage />} />}
                </Routes>
            </main>
            <AppFooter />
        </div>
    )
}


