import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Loading from './Loading'
import Navbar from './Navbar'
import Footer from './Footer'

const Layout = () => {
    const user = true;

    return user ? (
        <div className='w-full flex flex-col min-h-screen'>
            <Navbar />
            <div className='flex-1 bg-slate-50'>
                <Outlet />
            </div>
            <Footer />
        </div>
    ) : (
        <Loading height='h-screen'/>
    )
}

export default Layout