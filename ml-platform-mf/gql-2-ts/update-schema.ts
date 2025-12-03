#!/usr/bin/env node

import axios from 'axios'
import * as fs from 'fs-extra'
import * as path from 'path'
import {format, resolveConfig} from 'prettier'

const FILE_NAME = 'graphql.schema.json'

/* ========== OPEN SOURCE MODE - AUTHENTICATION REMOVED FROM SCHEMA UPDATE ==========
 * The following code has been modified to fetch GraphQL schema without authentication.
 * 
 * COMMENTED OUT: Original authentication flow
 * 1. Login to MONO_GQL_URL to get access token
 * 2. Use token to introspect MLP_GQL_URL
 * 
 * To re-enable authentication:
 * 1. Uncomment the original code below
 * 2. Comment out the simplified axios.post call
 * 3. Update the URLs to match your environment
 */

// COMMENTED OUT: Original URLs and authentication flow
// const MONO_GQL_URL = 'http://localhost:9999/graphql'
// const MLP_GQL_URL = 'http://localhost:9300/graphql'
//
// axios
//   .post(
//     MONO_GQL_URL,
//     {
//       query: `query login($username: String!, $password: String!, $grantType: String! = "password"){
//   login(username: $username, password: $password, grant_type : $grantType) {
//     accessToken
//   }
// }`,
//       variables: {username: 'all', password: 'all'}
//     },
//     {
//       headers: {
//         'content-type': 'application/json',
//         'x-access-token': '',
//         'x-skip-validation': 'true'
//       }
//     }
//   )
//   .then((res) => {
//     const X_ACCESS_TOKEN = res.data.data.login.accessToken
//     axios
//       .post(
//         MLP_GQL_URL,
//         {
//           query: fs.readFileSync(
//             path.resolve(__dirname, './introspect.graphql'),
//             'utf8'
//           )
//         },
//         {
//           headers: {
//             'x-access-token': X_ACCESS_TOKEN
//           }
//         }
//       )
//       .then((response) => {
//         const config = resolveConfig.sync('.')
//         return fs.writeFile(
//           FILE_NAME,
//           format(JSON.stringify(response.data), {...config, parser: 'json'})
//         )
//       })
//       .then(
//         // tslint:disable-next-line: no-console
//         () => console.log(`Updated ${FILE_NAME}`),
//         (err) => {
//           // tslint:disable-next-line: no-console
//           console.error(err.message)
//           process.exit(1)
//         }
//       )
//   })
//   .then(
//     // tslint:disable-next-line: no-console
//     () => {},
//     (err) => {
//       // tslint:disable-next-line: no-console
//       console.error(err.message)
//       process.exit(1)
//     }
//   )

/* ========== OPEN SOURCE MODE - Direct introspection without authentication ========== */
const GQL_URL = 'http://localhost:4000/graphql'

axios
  .post(
    GQL_URL,
    {
      query: fs.readFileSync(
        path.resolve(__dirname, './introspect.graphql'),
        'utf8'
      )
    },
    {
      headers: {
        'content-type': 'application/json'
      }
    }
  )
  .then((response) => {
    const config = resolveConfig.sync('.')
    return fs.writeFile(
      FILE_NAME,
      format(JSON.stringify(response.data), {...config, parser: 'json'})
    )
  })
  .then(
    // tslint:disable-next-line: no-console
    () => console.log(`Updated ${FILE_NAME}`),
    (err) => {
      // tslint:disable-next-line: no-console
      console.error(err.message)
      process.exit(1)
    }
  )

