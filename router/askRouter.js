import express from 'express'
const router = express.Router()
import {askController} from '../controller/appController.js'

router.route('/').post(askController)

export {
    router
}