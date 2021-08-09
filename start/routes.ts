/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

import User from '../app/Models/User'
import Client from '../app/Models/Client'
import Profile from 'App/Models/Profile'
import Shift from 'App/Models/Shift'
import Invoice from 'App/Models/Invoice'


import * as dotenv from 'dotenv'
import moment from 'moment'


Route.group(() => {

    Route.post('/register', async ({ request, response }) => {
        const user = new User()
        user.name = request.input('name')
        user.email = request.input('email')
        user.password = request.input('password')
        await user.save()
        return response.created()
    })

    Route.post('/login', async ({ auth, request, response }) => {
        
        const email = request.input('email')
        const password = request.input('password')
    
        try {
          const token = await auth.use('api').attempt(email, password,
            { expiresIn: '24hours', name: 'MobileToken' })
          return token
        }
        catch {
          return response.unauthorized()
        }
    })
})
.prefix('/api/v1')

Route.group(() => {
    
    Route.get('/profile', async ({ auth, request, response }) => {
        const user = auth.user!
        const profile = await Profile.findBy('userId', user.id)
        return {
            profile: profile
        }
    })

    Route.post('/profile', async ({ auth, request, response }) => {
        const user = auth.user!
        const profile = await Profile.firstOrCreate({ userId: user.id }, 
            {business: request.input('business'), abn: request.input('abn')})
        return {
            profile: profile
        }
    })

    Route.get('/clients', async ({ auth, request, response }) => {
        const user = auth.user!
        const clients = await user.related('clients').query()
        return {
            clients: clients
        }
    })

    Route.post('/clients', async ({ auth, request, response }) => {
        const user = auth.user!
        const client = new Client()
        client.name = request.input('name')
        client.email = request.input('email')
        await client.related('user').associate(user)
        await client.save()
        return {
            client: client
        }
    })

    Route.get('/logout', async ({ auth, response }) => {
        await auth.use('api').revoke()
        return {
            revoked: true
        }
    })
})
.middleware('api')
.prefix('/api/v1')
