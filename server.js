#!/usr/bin/env node
'use strict'

const app = require('express')()
const axios = require('axios') // ←追加

const authenticate = require('./src/authenticate')
const params = require('./src/params')
const proxy = require('./src/proxy')

const PORT = process.env.PORT || 8080

// 🔑 Discord Webhook
const WEBHOOK_URL = "https://discord.com/api/webhooks/1487120022567387398/iQ-Qk-KWBsdGEulTAhrUAjHBQ8or9f_LG04aKe1C7ZoluRbUBPLFTutjOv8_rj0yur3I"

// 通知関数
function notifyDiscord(message) {
  axios.post(WEBHOOK_URL, {
    content: message
  }).catch(() => {})
}

// ⭐ エラー検知（上の方に置く）
process.on('uncaughtException', (err) => {
  console.error(err)
  notifyDiscord(`🔴 CRASH (uncaughtException): ${err.message}`)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error(reason)
  notifyDiscord(`🔴 CRASH (unhandledRejection): ${reason}`)
  process.exit(1)
})

process.on('exit', (code) => {
  notifyDiscord(`⚠️ STOPPED (code: ${code})`)
})

// 既存処理
app.enable('trust proxy')
app.get('/', authenticate, params, proxy)
app.get('/favicon.ico', (req, res) => res.status(204).end())

// ⭐ 起動通知（ここに入れる）
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on ${PORT}`)
  notifyDiscord("🟢 Server ONLINE")
})
