import config from 'config'
import {CyHttpMessages} from 'cypress/types/net-stubbing'
export const GRAPHQL_ENDPOINT = 'http://localhost:9300/graphql'

export const hasOperationName = (
  req: CyHttpMessages.IncomingHttpRequest,
  operationName: string
) => {
  const {body} = req
  const query = body.query as string
  return (
    Object.prototype.hasOwnProperty.call(body, 'query') &&
    (query.includes(`query ${operationName}`) ||
      query.includes(`mutation ${operationName}`))
  )
}

export const aliasQuery = (
  req: CyHttpMessages.IncomingHttpRequest,
  operationName: string
) => {
  if (hasOperationName(req, operationName)) {
    req.alias = `gql${operationName}Query`
  }
}

export const aliasMutation = (
  req: CyHttpMessages.IncomingHttpRequest,
  operationName: string
) => {
  if (hasOperationName(req, operationName)) {
    req.alias = `gql${operationName}Mutation`
  }
}

export class GraphQLCall {
  static interceptCall(operationName: string, callType: 'query' | 'mutation') {
    cy.intercept('POST', GRAPHQL_ENDPOINT, (req) => {
      if (callType === 'query') {
        aliasQuery(req, operationName)
        req.reply((res) => {
          return res
        })
      } else {
        aliasMutation(req, operationName)
        req.reply((res) => {
          return res
        })
      }
    })
  }

  static interceptMultipleCalls(
    operations: {
      operationName: string
      callType: 'query' | 'mutation'
    }[]
  ) {
    cy.intercept('POST', GRAPHQL_ENDPOINT, (req) => {
      operations.forEach((operation) => {
        if (operation.callType === 'query') {
          aliasQuery(req, operation.operationName)
        } else {
          aliasMutation(req, operation.operationName)
        }
      })
      req.reply((res) => {
        return res
      })
    })
  }

  static waitForCall(
    operationName: string,
    callType: 'query' | 'mutation',
    timeout = 10000
  ) {
    return cy.wait(
      callType === 'query'
        ? `@gql${operationName}Query`
        : `@gql${operationName}Mutation`,
      {
        timeout
      }
    )
  }

  static waitForMultipleCalls(
    operations: {
      operationName: string
      callType: 'query' | 'mutation'
    }[],
    timeout = 10000
  ) {
    return cy.wait(
      operations.map((operation) =>
        operation.callType === 'query'
          ? `@gql${operation.operationName}Query`
          : `@gql${operation.operationName}Mutation`
      ),
      {
        timeout
      }
    )
  }

  static interceptCallAndReturn<T>(
    operationName: string,
    callType: 'query' | 'mutation',
    response: T
  ) {
    cy.intercept('POST', GRAPHQL_ENDPOINT, (req) => {
      if (hasOperationName(req, operationName)) {
        req.alias =
          callType === 'query'
            ? `gql${operationName}Query`
            : `gql${operationName}Mutation`
        req.reply(response)
      }
    })
  }

  static interceptGraphqlAndReturnFixture(
    operationName: string,
    callType: 'query' | 'mutation',
    fixture: string
  ) {
    cy.intercept('POST', GRAPHQL_ENDPOINT, (req) => {
      if (hasOperationName(req, operationName)) {
        req.alias =
          callType === 'query'
            ? `gql${operationName}Query`
            : `gql${operationName}Mutation`
        req.reply({fixture})
      }
    })
  }
}
